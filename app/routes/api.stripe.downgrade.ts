import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId } from "~/users/queries";
import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);

  if (!userId) {
    return redirect("/login");
  }

  // 1. Update subscription status to canceled
  const { error: subError } = await client
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", userId)
    .eq("status", "active");

  if (subError) {
    console.error("Error canceling subscription:", subError);
    return redirect("/pricing?error=downgrade_failed");
  }

  // 2. Update user profile role to free
  const { error: profileError } = await client
    .from("profiles")
    .update({ role: "free" })
    .eq("profile_id", userId);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return redirect("/pricing?error=downgrade_failed");
  }

  return redirect("/pricing?success=downgrade");
}
