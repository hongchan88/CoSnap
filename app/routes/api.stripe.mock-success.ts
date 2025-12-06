import { createSupabaseClient } from "~/lib/supabase";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const planType = url.searchParams.get("planType");

  if (!userId || !planType) {
    return redirect("/pricing?error=missing_params");
  }

  // 1. Create subscription record
  const { error: subError } = await client.from("subscriptions").insert({
    user_id: userId,
    stripe_subscription_id: `sub_mock_${Date.now()}`,
    status: "active",
    plan_type: planType,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
  });

  if (subError) {
    console.error("Error creating subscription:", subError);
    return redirect("/pricing?error=db_error");
  }

  // 2. Update user profile role
  const { error: profileError } = await client
    .from("profiles")
    .update({ role: "premium" })
    .eq("profile_id", userId);

  if (profileError) {
    console.error("Error updating profile:", profileError);
  }

  return redirect("/pricing?success=true");
}
