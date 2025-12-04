import { createSupabaseClient } from "~/lib/supabase";
import type { Route } from "./+types/profile";
import { useState, Suspense } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import ProfileForm from "../components/ProfileForm";
import FocusMeter from "../components/FocusMeter";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Avatar from "../components/Avatar";
import Notification from "../components/ui/Notification";
import ResponsiveGrid from "../components/ui/ResponsiveGrid";
import { ResponsiveGridItem } from "../components/ui/ResponsiveGrid";
import StatsCard from "../components/ui/StatsCard";
import FocusChart from "../components/ui/FocusChart";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { NumberTicker } from "../components/ui/MagicNumberTicker";
import GlowCard from "../components/ui/GlowCard";
import ShimmerButton from "../components/ui/ShimmerButton";
import { Skeleton } from "../components/ui/skeleton";
import {
  Camera,
  MapPin,
  Star,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Smartphone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getLoggedInUserId, getUserProfile } from "~/users/queries";
import { updateUserProfile } from "~/users/mutations";
import { uploadAvatar } from "~/lib/supabase";
import type { ProfileWithStats } from "~/users/queries";

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

  const { profile } = await getUserProfile(client, userId);

  return { profile };
}

export async function action({ request }: Route.ActionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const intent = formData.get("intent");

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
const adaptUserProfile = (dbProfile: ProfileWithStats | null): UserProfile => {
  if (!dbProfile) {
    return {
      username: "User",
      bio: "",
      cameraGear: "",
      photoStyles: [],
      languages: [],
      location: "위치 정보",
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
    location: "위치 정보", // TODO: Add location field to profile or get from flags
    isPremium: dbProfile.role === "premium",
    focusScore: dbProfile.focus_score || 0,
    avatarUrl: dbProfile.avatar_url,
  };
};

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-4 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

function ProfileContent({
  profileData,
}: {
  profileData: ProfileWithStats | null;
}) {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize profile from passed data with adapter
  const profile = adaptUserProfile(profileData);

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

  // Focus score history for chart
  const focusHistory = [
    { date: "2024-10-15", score: 45, event: "첫 CoSnap 완료" },
    { date: "2024-10-20", score: 50, event: "긍정 리뷰 받음" },
    { date: "2024-10-25", score: 55, event: "도쿄 여행 CoSnap" },
    { date: "2024-11-01", score: 60, event: "프리미엄 보너스" },
    { date: "2024-11-05", score: 65, event: "박철민 님과 CoSnap" },
  ];

  // Statistics
  const stats = [
    {
      title: "완료된 CoSnap",
      value: 12,
      icon: <Users className="w-5 h-5" />,
      color: "blue" as const,
      trend: { value: 20, isPositive: true },
    },
    {
      title: "평균 리뷰 점수",
      value: 4.8,
      icon: <Star className="w-5 h-5" />,
      color: "green" as const,
      suffix: "/5.0",
      trend: { value: 5, isPositive: true },
    },
    {
      title: "방문한 도시",
      value: 8,
      icon: <MapPin className="w-5 h-5" />,
      color: "purple" as const,
      trend: { value: 15, isPositive: true },
    },
  ];

  // Focus 히스토리
  const focusActivities = [
    {
      score: "+5",
      description: "박철민 님과 CoSnap 완료",
      time: "2일 전",
      type: "positive",
    },
    {
      score: "+5",
      description: "이서아 님으로부터 긍정 리뷰",
      time: "5일 전",
      type: "positive",
    },
    {
      score: "+10",
      description: "프리미엄 보너스 (월간)",
      time: "1주 전",
      type: "bonus",
    },
    {
      score: "-10",
      description: "노쇼 페널티 (취소됨)",
      time: "2주 전",
      type: "negative",
    },
    {
      score: "+5",
      description: "김민준 님과 CoSnap 완료",
      time: "3주 전",
      type: "positive",
    },
  ];

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
              actionData.error ||
              (actionData.action === "updateProfile"
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

      {/* 프로필 헤더 */}
      <Card className="mb-6 sm:mb-8">
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
            <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
    </>
  );
}

export default function ProfilePage() {
  const { profile } = useLoaderData<typeof loader>();

  console.log(profile, "profile data in ProfilePage");
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            프로필
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            프로필 정보를 관리하고 CoSnap 활동을 확인하세요
          </p>
        </div>

        <Suspense fallback={<ProfileSkeleton />}>
          {profile && <ProfileContent profileData={profile} />}
        </Suspense>
      </div>
    </div>
  );
}
