import { useState } from "react";
import { useLoaderData, useFetcher, Link } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId, getUserOffers } from "~/users/queries";
import { acceptOffer, declineOffer, cancelOffer } from "~/users/mutations";
import type { Route } from "./+types/inbox";
import { useLanguage } from "~/context/language-context";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export async function loader({ request }: Route.LoaderArgs) {
  const { client, headers } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);

  const { success, sent, received, error } = await getUserOffers(client, userId);

  if (!success) {
    console.error("Failed to fetch offers:", error);
    throw new Response("Failed to load offers", { status: 500 });
  }

  return { sent, received, userId };
}

export async function action({ request }: Route.ActionArgs) {
  const { client, headers } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const offerId = formData.get("offerId") as string;

  if (!offerId) return { success: false, error: "Offer ID is required" };

  if (intent === "accept_offer") {
    return await acceptOffer(client, offerId, userId);
  } else if (intent === "decline_offer") {
    return await declineOffer(client, offerId, userId);
  } else if (intent === "cancel_offer") {
    return await cancelOffer(client, offerId, userId);
  }

  return null;
}

export default function Inbox() {
  const { sent, received, userId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t ? t("inbox.status.pending") : "대기중"}</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t ? t("inbox.status.accepted") : "수락됨"}</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t ? t("inbox.status.declined") : "거절됨"}</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{t ? t("inbox.status.cancelled") : "취소됨"}</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">{t ? t("inbox.status.expired") : "만료됨"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t ? t("inbox.title") : "인박스"}</h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="received">{t ? t("inbox.receivedOffers") : "받은 오퍼"} ({received.length})</TabsTrigger>
          <TabsTrigger value="sent">{t ? t("inbox.sentOffers") : "보낸 오퍼"} ({sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {received.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t ? t("inbox.noReceivedOffers") : "아직 받은 오퍼가 없습니다."}</p>
            </div>
          ) : (
            received.map((offer) => (
              <Card key={offer.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={offer.sender?.avatar_url || ""} />
                        <AvatarFallback>{offer.sender?.username?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{offer.sender?.username}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(offer.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">{t ? t("inbox.destination") : "여행지"}</div>
                    <div className="text-gray-900">
                      {offer.flag?.city}, {offer.flag?.country} ({new Date(offer.flag?.start_date || "").toLocaleDateString()} - {new Date(offer.flag?.end_date || "").toLocaleDateString()})
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap text-sm">
                    {offer.message}
                  </div>

                  {offer.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <fetcher.Form method="post">
                        <input type="hidden" name="offerId" value={offer.id} />
                        <input type="hidden" name="intent" value="decline_offer" />
                        <Button variant="outline" type="submit" disabled={fetcher.state !== "idle"}>
                          {t ? t("inbox.decline") : "거절하기"}
                        </Button>
                      </fetcher.Form>
                      <fetcher.Form method="post">
                        <input type="hidden" name="offerId" value={offer.id} />
                        <input type="hidden" name="intent" value="accept_offer" />
                        <Button type="submit" disabled={fetcher.state !== "idle"}>
                          {t ? t("inbox.accept") : "수락하기"}
                        </Button>
                      </fetcher.Form>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sent.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t ? t("inbox.noSentOffers") : "아직 보낸 오퍼가 없습니다."}</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/explore">{t ? t("inbox.exploreDestinations") : "여행지 둘러보기"}</Link>
              </Button>
            </div>
          ) : (
            sent.map((offer) => (
              <Card key={offer.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={offer.receiver?.avatar_url || ""} />
                        <AvatarFallback>{offer.receiver?.username?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{t ? t("inbox.to") : "To:"} {offer.receiver?.username}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(offer.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">{t ? t("inbox.destination") : "여행지"}</div>
                    <div className="text-gray-900">
                      {offer.flag?.city}, {offer.flag?.country}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap text-sm">
                    {offer.message}
                  </div>

                  {offer.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <fetcher.Form method="post">
                        <input type="hidden" name="offerId" value={offer.id} />
                        <input type="hidden" name="intent" value="cancel_offer" />
                        <Button variant="outline" type="submit" disabled={fetcher.state !== "idle"}>
                          {t ? t("inbox.cancel") : "취소하기"}
                        </Button>
                      </fetcher.Form>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
