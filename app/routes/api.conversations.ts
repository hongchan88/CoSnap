import { type ActionFunctionArgs, data } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { conversations, profiles, posts, offers } from "~/db/schema";
import { eq, and, or, sql } from "drizzle-orm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client: supabase, headers } = createSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const targetUserId = formData.get("targetUserId") as string;
  const postId = formData.get("postId") as string | null;
  const initialMessage = formData.get("message") as string | null;

  if (!targetUserId) {
    return data({ error: "Target user ID is required" }, { status: 400 });
  }

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  // Check if conversation already exists
  const [existingConversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        or(
          and(eq(conversations.userAId, user.id), eq(conversations.userBId, targetUserId)),
          and(eq(conversations.userAId, targetUserId), eq(conversations.userBId, user.id))
        ),
        postId ? eq(conversations.postId, postId) : undefined
      )
    )
    .limit(1);

  if (existingConversation) {
    return data({ conversation: existingConversation }, { headers });
  }

  // Check user profile for credits/role
  const [currentUserProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.profile_id, user.id))
    .limit(1);

  if (!currentUserProfile) {
    return data({ error: "Profile not found" }, { status: 404 });
  }

  // Credit logic
  if (currentUserProfile.role === "free") {
    if (currentUserProfile.cocreditBalance < 1) {
      return data({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 403 });
    }

    // Deduct credit
    await db
      .update(profiles)
      .set({ cocreditBalance: sql`${profiles.cocreditBalance} - 1` })
      .where(eq(profiles.profile_id, user.id));
  }

  // Hybrid Logic: Check Post Type
  let newOfferId: string | null = null;

  if (postId) {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    
    if (post) {
      const isTransactional = ["help", "offer"].includes(post.type);
      
      if (isTransactional) {
        // Create Offer
        const [newOffer] = await db
          .insert(offers)
          .values({
            senderId: user.id,
            receiverId: targetUserId,
            postId: post.id,
            message: initialMessage || "I am interested in your post.",
            status: "pending",
          })
          .returning();
        
        newOfferId = newOffer.id;
      }
    }
  }

  // Create conversation
  try {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userAId: user.id,
        userBId: targetUserId,
        postId: postId || undefined,
        offerId: newOfferId || undefined,
      })
      .returning();

    return data({ conversation: newConversation }, { headers });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return data({ error: "Failed to create conversation" }, { status: 500, headers });
  }
};

