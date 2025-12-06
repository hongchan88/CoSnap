import { type ActionFunctionArgs, data } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { offers, conversations } from "~/db/schema";
import { eq, and } from "drizzle-orm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client: supabase, headers } = createSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const offerId = formData.get("offerId") as string;
  const intent = formData.get("intent") as string; // "accept" or "decline"

  if (!offerId || !intent) {
    return data({ error: "Offer ID and intent are required" }, { status: 400 });
  }

  if (!["accept", "decline"].includes(intent)) {
    return data({ error: "Invalid intent" }, { status: 400 });
  }

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  // Verify offer exists and user is the receiver
  const [offer] = await db
    .select()
    .from(offers)
    .where(and(eq(offers.id, offerId), eq(offers.receiverId, user.id)))
    .limit(1);

  if (!offer) {
    return data({ error: "Offer not found or access denied" }, { status: 404 });
  }

  if (offer.status !== "pending") {
    return data({ error: "Offer is not pending" }, { status: 400 });
  }

  const newStatus = intent === "accept" ? "accepted" : "declined";

  try {
    const [updatedOffer] = await db
      .update(offers)
      .set({ status: newStatus })
      .where(eq(offers.id, offerId))
      .returning();

    return data({ offer: updatedOffer }, { headers });
  } catch (error) {
    console.error("Error updating offer:", error);
    return data({ error: "Failed to update offer" }, { status: 500, headers });
  }
};
