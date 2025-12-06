import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId } from "~/users/queries";
import { createCheckoutSession } from "~/lib/stripe.server";
import { redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);

  if (!userId) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const planType = formData.get("planType") as "premium_monthly" | "premium_yearly";

  if (!planType) {
    return { success: false, error: "Invalid plan type" };
  }

  try {
    const checkoutUrl = await createCheckoutSession(userId, planType);
    return redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout error:", error);
    return { success: false, error: "Failed to initiate checkout" };
  }
}
