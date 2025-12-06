import { type ActionFunctionArgs, data } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { messages, conversations } from "~/db/schema";
import { eq, and, or } from "drizzle-orm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client: supabase, headers } = createSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const conversationId = formData.get("conversationId") as string;
  const content = formData.get("content") as string;

  if (!conversationId || !content) {
    return data({ error: "Conversation ID and content are required" }, { status: 400 });
  }

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  // Verify user is part of the conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userAId, user.id), eq(conversations.userBId, user.id))
      )
    )
    .limit(1);

  if (!conversation) {
    return data({ error: "Conversation not found or access denied" }, { status: 404 });
  }

  try {
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: user.id,
        content,
      })
      .returning();

    return data({ message: newMessage }, { headers });
  } catch (error) {
    console.error("Error sending message:", error);
    return data({ error: "Failed to send message" }, { status: 500, headers });
  }
};

