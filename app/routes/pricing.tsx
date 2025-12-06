import { useLoaderData, Form, useNavigation } from "react-router";
import { Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId } from "~/users/queries";
import { useLanguage } from "~/context/language-context";

export async function loader({ request }: { request: Request }) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const url = new URL(request.url);
  const success = url.searchParams.get("success");
  const error = url.searchParams.get("error");

  let currentPlan = "free";

  if (userId) {
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("profile_id", userId)
      .single();
    if (profile) {
      currentPlan = profile.role;
    }
  }

  return { currentPlan, userId, success, error };
}

export default function PricingPage() {
  const { currentPlan, userId, success, error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { t } = useLanguage();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Experience</h1>
        <p className="text-xl text-gray-600">
          Unlock premium features and get more visibility for your flags.
        </p>
      </div>

      {success && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-center">
          {success === "downgrade" 
            ? "Your plan has been downgraded to Free." 
            : "🎉 Success! Your 30-day free trial has started."}
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
          Payment failed. Please try again.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={`relative ${currentPlan === "free" ? "border-blue-500 border-2" : ""}`}>
          {currentPlan === "free" && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>For casual travelers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>1 Active Flag</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Current GPS Location Only</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Receive offers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Standard visibility</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === "free" ? (
              <Button className="w-full" variant="outline" disabled>
                Active
              </Button>
            ) : (
              <Form method="post" action="/api/stripe/downgrade" className="w-full">
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Downgrade to Free"}
                </Button>
              </Form>
            )}
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`relative ${currentPlan === "premium" ? "border-blue-500 border-2 shadow-lg" : ""}`}>
           {currentPlan === "premium" && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Premium</CardTitle>
            <CardDescription>For serious photographers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$9.99<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <div className="text-sm text-green-600 font-medium mb-6">First 30 days free!</div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span>5 Active Flags</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Post Anywhere (Teleport Mode)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Priority Map Exposure (Pinned)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span>Verified "Premium" Badge</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span>2x Focus Score Accumulation</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === "premium" ? (
              <Button className="w-full" variant="outline" disabled>
                Active
              </Button>
            ) : (
              <Form method="post" action="/api/stripe/checkout" className="w-full">
                <input type="hidden" name="planType" value="premium_monthly" />
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || !userId}
                >
                  {isSubmitting ? "Processing..." : userId ? "Start Free Trial" : "Log in to Start Trial"}
                </Button>
              </Form>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
