import { createSupabaseClient } from "~/lib/supabase";
import type { Route } from "./+types/profile";
import { useState, Suspense } from "react";
import { useLoaderData, useActionData, useSubmit, useFetcher, Link, Await } from "react-router";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ProfileForm from "../components/ProfileForm";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Avatar from "../components/Avatar";
import { Avatar as AvatarComponent, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Notification from "../components/ui/Notification";
import {
  Camera,
  MapPin,
  Settings,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getLoggedInUserId, getUserProfile, getUserOffers, getUserConversations, getUserAllFlags } from "~/users/queries";
import { updateUserProfile, acceptOffer, declineOffer, cancelOffer } from "~/users/mutations";
import { uploadAvatar } from "~/lib/supabase";
import type { ProfileWithStats } from "~/users/queries";
import { useLanguage } from "~/context/language-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "프로필 - CoSnap" },
    {
      name: "description",
      content: "프로필을 관리하고 Focus 점수를 확인하세요",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);

  const dataPromise = (async () => {
    const { profile, error: profileError } = await getUserProfile(client, userId);
  
    if (profileError || !profile) {
       console.error("Failed to fetch profile:", profileError);
       throw new Response("Profile not found", { status: 404 });
    }

    // Fetch all flags to determine location
    const { flags = [] } = await getUserAllFlags(client, userId);
    
    // Derive location from the most recent active flag
    const activeFlag = flags?.find(f => f.visibility_status === 'active');
    const location = activeFlag 
      ? `${activeFlag.city}, ${activeFlag.country}` 
      : "위치 정보 미설정"; // "Location not set"

    // Also fetch inbox data like inbox.tsx does
    const { success, sent, received, error } = await getUserOffers(client, userId);
    const { success: convSuccess, conversations, error: convError } = await getUserConversations(client, userId);

    if (!success || !convSuccess) {
      console.error("Failed to fetch profile data:", error || convError);
    }

    return { 
      profile, 
      location, 
      sent: sent || [], 
      received: received || [], 
      conversations: conversations || [], 
      userId 
    };
  })();

  return { data: dataPromise };
}

export async function action({ request }: Route.ActionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const offerId = formData.get("offerId") as string;

  // Handle inbox actions (accept/decline/cancel offers)
  if (intent === "accept_offer" || intent === "decline_offer" || intent === "cancel_offer") {
    if (!offerId) return { success: false, error: "Offer ID is required" };

    if (intent === "accept_offer") {
      return await acceptOffer(client, offerId, userId);
    } else if (intent === "decline_offer") {
      return await declineOffer(client, offerId, userId);
    } else if (intent === "cancel_offer") {
      return await cancelOffer(client, offerId, userId);
    }
  }

  if (intent === "updateProfile") {
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const cameraGear = formData.get("cameraGear") as string;
    const styles = formData.get("photoStyles")?.toString().split(",") || [];
    const languages = formData.get("languages")?.toString().split(",") || [];
    const location = formData.get("location") as string;
    const avatarFile = formData.get("avatarFile") as File | null;

    let avatarUrl = undefined;

    // Handle avatar upload if file provided
    if (avatarFile && avatarFile.size > 0) {
      console.log("Avatar file received:", avatarFile.name, avatarFile.size);
      const uploadResult = await uploadAvatar(client, avatarFile, userId);
      console.log("Upload result:", uploadResult);

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || "Failed to upload avatar",
        };
      }
      avatarUrl = uploadResult.url;
    } else {
      console.log("No avatar file received or file is empty");
    }

    const { success, error } = await updateUserProfile(client, userId, {
      username,
      bio,
      cameraGear,
      styles,
      languages,
      location,
      avatarUrl,
    });

    console.log("Update profile result:", { success, error, avatarUrl });

    if (!success)
      return { success: false, error: error || "Failed to update profile" };

    // Add refresh to prevent caching issues after successful avatar update
    if (avatarUrl) {
      return { success: true, action: "updateProfile", refresh: Date.now() };
    }

    return { success: true, action: "updateProfile" };
  }

  return { success: false, error: "Invalid intent" };
}

interface UserProfile {
  username: string;
  bio: string;
  cameraGear: string;
  photoStyles: string[];
  languages: string[];
  location: string;
  isPremium: boolean;
  focusScore: number;
  avatarUrl?: string | null;
}

// Adapter function to convert database profile to UI format
// Adapter function to convert database profile to UI format
const adaptUserProfile = (dbProfile: ProfileWithStats | null, locationFromFlags?: string): UserProfile => {
  if (!dbProfile) {
    return {
      username: "User",
      bio: "",
      cameraGear: "",
      photoStyles: [],
      languages: [],
      location: locationFromFlags || "위치 정보 미설정",
      isPremium: false,
      focusScore: 0,
    };
  }
  console.log("Adapting user profile:", dbProfile);
  return {
    username: dbProfile.username,
    bio: dbProfile.bio || "",
    cameraGear: dbProfile.camera_gear || "",
    photoStyles: dbProfile.styles || [],
    languages: dbProfile.languages || [],
    location: locationFromFlags || "위치 정보 미설정", 
    isPremium: dbProfile.role === "premium",
    focusScore: dbProfile.focus_score || 0,
    avatarUrl: dbProfile.avatar_url,
  };
};

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-6">
        <div className="lg:w-64">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function MessagesContent({ sent, received, conversations, userId }: { sent: any[]; received: any[]; conversations: any[]; userId: string }) {
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
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{t ? t("profile.tabs.messages") : "메세지"}</h3>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="messages">메시지 ({conversations?.length || 0})</TabsTrigger>
            <TabsTrigger value="received">{t ? t("inbox.receivedOffers") : "받은 오퍼"} ({received.length})</TabsTrigger>
            <TabsTrigger value="sent">{t ? t("inbox.sentOffers") : "보낸 오퍼"} ({sent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {conversations && conversations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">아직 대화가 없습니다.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/explore">여행지 둘러보기</Link>
                </Button>
              </div>
            ) : (
              conversations?.map((conv) => (
                <Link key={conv.id} to={`/inbox/${conv.id}`}>
                  <Card className="hover:bg-gray-50 transition-colors mb-4">
                    <CardContent className="p-4 flex items-center gap-4">
                      <AvatarComponent className="h-12 w-12">
                        <AvatarImage src={conv.partner?.avatar_url || ""} />
                        <AvatarFallback>{conv.partner?.username?.[0] || "?"}</AvatarFallback>
                      </AvatarComponent>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conv.partner?.username}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {conv.last_message ? new Date(conv.last_message.created_at).toLocaleDateString() : new Date(conv.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.last_message?.content || "대화를 시작해보세요."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

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
                        <AvatarComponent className="h-10 w-10">
                          <AvatarImage src={offer.sender?.avatar_url || ""} />
                          <AvatarFallback>{offer.sender?.username?.[0] || "?"}</AvatarFallback>
                        </AvatarComponent>
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
                        <AvatarComponent className="h-10 w-10">
                          <AvatarImage src={offer.receiver?.avatar_url || ""} />
                          <AvatarFallback>{offer.receiver?.username?.[0] || "?"}</AvatarFallback>
                        </AvatarComponent>
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
      </CardContent>
    </Card>
  );
}

interface ProfileContentProps {
  profileData: ProfileWithStats | null;
  location: string;
  sent: any[];
  received: any[];
  conversations: any[];
  userId: string;
}

function ProfileContent({
  profileData,
  location,
  sent,
  received,
  conversations,
  userId,
}: ProfileContentProps) {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useLanguage();

  // Initialize profile from passed data with adapter
  const profile = adaptUserProfile(profileData, location);

  const handleUpdateProfile = async (formData: any) => {
    setIsLoading(true);
    const data = new FormData();
    data.append("intent", "updateProfile");
    data.append("username", formData.username);
    data.append("bio", formData.bio);
    data.append("cameraGear", formData.cameraGear);
    data.append("photoStyles", formData.photoStyles.join(","));
    data.append("languages", formData.languages.join(","));
    data.append("location", formData.location);

    // Handle avatar file
    if (formData.avatarFile) {
      data.append("avatarFile", formData.avatarFile);
    }

    submit(data, { method: "post", encType: "multipart/form-data" });
    setIsEditingProfile(false);
    setIsLoading(false);
  };

  const getLanguageNames = (languages: string[]): string => {
    const languageMap: { [key: string]: string } = {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      fr: "Français",
      es: "Español",
    };
    return languages.map((lang) => languageMap[lang] || lang).join(", ");
  };

  return (
    <>
      {/* 알림 */}
      {actionData && (
        <div className="mb-6">
          <Notification
            type={actionData.success ? "success" : "error"}
            message={
              (actionData && "error" in actionData ? actionData.error : undefined) ||
              (actionData && "action" in actionData && actionData.action === "updateProfile"
                ? "프로필이 업데이트되었습니다."
                : "")
            }
            onClose={() => {}}
            autoClose={true}
          />
        </div>
      )}

      {/* 프로필 편집 모달 */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>프로필 편집</DialogTitle>
          </DialogHeader>
          <ProfileForm
            onSubmit={handleUpdateProfile}
            onCancel={() => setIsEditingProfile(false)}
            initialData={{
              username: profile.username,
              bio: profile.bio,
              cameraGear: profile.cameraGear,
              photoStyles: profile.photoStyles,
              languages: profile.languages,
              location: profile.location,
              avatarUrl: profile.avatarUrl,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 좌측 탭과 메인 콘텐츠 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 좌측 탭 */}
        <div className="lg:w-64">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="profile">{t ? t("profile.tabs.profile") : "프로필"}</TabsTrigger>
              <TabsTrigger value="messages">{t ? t("profile.tabs.messages") : "메세지"}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="profile" className="mt-0">
              <div className="space-y-6">
                {/* 프로필 헤더 */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      <Avatar
                        src={profile.avatarUrl}
                        size="lg"
                        alt={`${profile.username}의 프로필 사진`}
                      />
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            @{profile.username}
                          </h2>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 w-fit">
                            프리미엄
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm sm:text-base text-gray-600">
                            {profile.location}
                          </p>
                          {profile.cameraGear && (
                            <>
                              <span className="text-gray-300">|</span>
                              <Camera className="w-4 h-4 text-gray-400" />
                              <p className="text-sm sm:text-base text-gray-600">
                                {profile.cameraGear}
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 mb-4">
                          {profile.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.photoStyles.map((style, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs sm:text-sm"
                            >
                              {style}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {getLanguageNames(profile.languages)}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => setIsEditingProfile(true)}
                          disabled={isLoading}
                          className="w-full sm:w-auto"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" color="white" />
                              로딩 중...
                            </>
                          ) : (
                            "프로필 편집"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 설정 */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">설정</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              알림 설정
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              새 오퍼, 메시지, 매치 알림
                            </div>
                          </div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Award className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              개인정보 보호
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              프로필 공개 설정, 데이터 관리
                            </div>
                          </div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              구독 관리
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              프리미엄 구독, 결제 정보
                            </div>
                          </div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-red-600 text-sm sm:text-base">
                              로그아웃
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              계정에서 로그아웃
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          로그아웃
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <MessagesContent sent={sent} received={received} conversations={conversations} userId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  const { data } = useLoaderData<typeof loader>();
  const { t } = useLanguage();

  console.log(data, "profile data in ProfilePage");
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t ? t("profile.title") : "프로필"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t ? t("profile.description") : "프로필 정보를 관리하고 CoSnap 활동을 확인하세요"}
          </p>
        </div>

        <Suspense fallback={<ProfileSkeleton />}>
          <Await resolve={data}>
            {(resolvedData) => (
             <ProfileContent
              profileData={resolvedData.profile}
              location={resolvedData.location}
              sent={resolvedData.sent}
              received={resolvedData.received}
              conversations={resolvedData.conversations}
              userId={resolvedData.userId}
            />
          )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}