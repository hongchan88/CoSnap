import type { Route } from "./+types/profile";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import ProfileForm from "../components/ProfileForm";
import FocusMeter from "../components/FocusMeter";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Notification from "../components/ui/Notification";
import ResponsiveGrid from "../components/ui/ResponsiveGrid";
import { ResponsiveGridItem } from "../components/ui/ResponsiveGrid";
import StatsCard from "../components/ui/StatsCard";
import FocusChart from "../components/ui/FocusChart";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { NumberTicker } from "../components/ui/MagicNumberTicker";
import GlowCard from "../components/ui/GlowCard";
import ShimmerButton from "../components/ui/ShimmerButton";
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
import { getProfileByUserId, getStatsForProfile } from "~/lib/database";

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
  // Return empty data for now - authentication will be handled client-side
  return { profile: null, stats: null };
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
}

// Adapter function to convert database profile to UI format
const adaptUserProfile = (dbProfile: any, stats: any): UserProfile => {
  return {
    username: dbProfile?.username || "User",
    bio: dbProfile?.bio || "",
    cameraGear: dbProfile?.cameraGear || "",
    photoStyles: dbProfile?.styles || [],
    languages: dbProfile?.languages || [],
    location: "위치 정보", // TODO: Add location field to profile or get from flags
    isPremium: dbProfile?.role === "premium",
    focusScore: stats?.focusScore || dbProfile?.focusScore || 0,
  };
};

export default function ProfilePage() {
  const loaderData = useLoaderData<typeof loader>();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Initialize profile from loader data with adapter
  const [profile, setProfile] = useState<UserProfile>(() =>
    adaptUserProfile(loaderData.profile, loaderData.stats)
  );

  const handleUpdateProfile = async (formData: any) => {
    setIsLoading(true);

    try {
      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setProfile((prev) => ({
        ...prev,
        username: formData.username,
        bio: formData.bio,
        cameraGear: formData.cameraGear,
        photoStyles: formData.photoStyles,
        languages: formData.languages,
        location: formData.location,
      }));
    } catch (error) {
      throw new Error("프로필 업데이트에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
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

        {/* 알림 */}
        {notification && (
          <div className="mb-6">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
              autoClose={true}
            />
          </div>
        )}

        {/* 프로필 편집 폼 */}
        {isEditingProfile && (
          <div className="mb-8">
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
              }}
            />
          </div>
        )}

        {/* 프로필 헤더 */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
              </div>
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

        {/* 통계 및 Focus 점수 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
          {/* Focus 점수 섹션 */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Focus 점수
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Focus 시스템 알아보기
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <FocusMeter
                    score={profile.focusScore}
                    size="lg"
                    showProgress={true}
                    animated={true}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    최근 활동
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {focusActivities.slice(0, 3).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              activity.type === "positive"
                                ? "text-green-600"
                                : activity.type === "negative"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {activity.score}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-700">
                            {activity.description}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Focus 점수 변화 차트 */}
          <div className="lg:col-span-2">
            <FocusChart data={focusHistory} />
          </div>
        </div>

        {/* Magic UI 통계 카드 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Magic UI 통계
            </h3>
            <Badge variant="outline" className="text-xs">
              ✨ Magic UI
            </Badge>
          </div>

          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={{ mobile: 4, tablet: 6, desktop: 6 }}
          >
            {/* NumberTicker Glow Card */}
            <ResponsiveGridItem delay={0}>
              <GlowCard
                glowColor="rgb(59, 130, 246)"
                glowIntensity="high"
                hover={true}
                variant="gradient"
              >
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Focus 점수</div>
                  <div className="flex items-center gap-1">
                    <NumberTicker
                      value={profile.focusScore}
                      className="text-4xl font-bold text-blue-600"
                      delay={0.5}
                      decimalPlaces={0}
                    />
                    <span className="text-4xl font-bold text-blue-600">점</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">현재 레벨</div>
                </div>
              </GlowCard>
            </ResponsiveGridItem>

            {/* NumberTicker Stats Card */}
            <ResponsiveGridItem delay={0.1}>
              <GlowCard
                glowColor="rgb(34, 197, 94)"
                glowIntensity="medium"
                hover={true}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    완료된 CoSnap
                  </div>
                  <NumberTicker
                    value={12}
                    delay={0.3}
                    className="text-4xl font-bold text-green-600"
                    decimalPlaces={0}
                  />
                  <div className="text-xs text-gray-500 mt-2">+20% 이번 달</div>
                </div>
              </GlowCard>
            </ResponsiveGridItem>

            {/* Shimmer Button Card */}
            <ResponsiveGridItem delay={0.2}>
              <GlowCard
                glowColor="rgb(168, 85, 247)"
                glowIntensity="medium"
                hover={true}
                variant="glass"
              >
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    프리미엄 등급
                  </div>
                  <div className="text-4xl font-bold text-purple-600">
                    Crystal
                  </div>
                  <ShimmerButton
                    background="linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(59, 130, 246) 100%)"
                    className="w-full"
                    onClick={() => console.log("프리미엄 혜택 보기")}
                  >
                    혜택 보기
                  </ShimmerButton>
                </div>
              </GlowCard>
            </ResponsiveGridItem>
          </ResponsiveGrid>
        </div>

        {/* 기존 통계 카드 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">일반 통계</h3>
          </div>
          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={{ mobile: 4, tablet: 6, desktop: 6 }}
          >
            {stats.map((stat, index) => (
              <ResponsiveGridItem key={index} delay={index * 0.1}>
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  suffix={stat.suffix}
                  color={stat.color}
                  trend={stat.trend}
                />
              </ResponsiveGridItem>
            ))}
          </ResponsiveGrid>
        </div>

        {/* 장비 정보 */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">사진 장비</h3>
          </CardHeader>
          <CardContent>
            {profile.cameraGear ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Canon EOS R6
                    </div>
                    <div className="text-sm text-gray-500">메인 카메라</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      iPhone 15 Pro
                    </div>
                    <div className="text-sm text-gray-500">모바일 촬영</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  장비 정보가 없습니다. 프로필 편집에서 추가해주세요.
                </p>
              </div>
            )}
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
      </div>
    </div>
  );
}
