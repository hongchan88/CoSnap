import { useLoaderData, Link } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getUserOffers } from "~/users/queries";
import type { Route } from "./+types/inbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export async function loader({ request }: Route.LoaderArgs) {
  const { client, headers } = createSupabaseClient(request);
  
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { success, sent, received, error } = await getUserOffers(client, user.id);

  if (!success) {
    console.error("Failed to fetch offers:", error);
    throw new Response("Failed to load offers", { status: 500 });
  }

  return { sent, received };
}

function OfferList({ offers, type }: { offers: any[], type: "sent" | "received" }) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No {type} offers found.</p>
        {type === "sent" && (
          <Link to="/explore" className="text-blue-600 hover:underline mt-2 inline-block">
            Explore flags to send an offer
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {type === "received" ? (
                    <span>From: {offer.sender?.username || "Unknown"}</span>
                  ) : (
                    <span>To: {offer.receiver?.username || "Unknown"}</span>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  📍 {offer.flag?.city}, {offer.flag?.country}
                </p>
              </div>
              <Badge variant={
                offer.status === "accepted" ? "default" :
                offer.status === "pending" ? "secondary" :
                "outline"
              }>
                {offer.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 line-clamp-2 mb-3">"{offer.message}"</p>
            <div className="text-xs text-gray-400">
              {new Date(offer.sent_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Inbox() {
  const { sent, received } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inbox</h1>
      
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="received">
            Received ({received.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sent.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="received">
          <OfferList offers={received} type="received" />
        </TabsContent>
        
        <TabsContent value="sent">
          <OfferList offers={sent} type="sent" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
