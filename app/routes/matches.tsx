import type { Route } from "./+types/matches";
import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import MatchCard from "../components/ui/MatchCard";
import ResponsiveGrid from "../components/ui/ResponsiveGrid";
import { ResponsiveGridItem } from "../components/ui/ResponsiveGrid";
import StatsCard from "../components/ui/StatsCard";
import GlowCard from "../components/ui/GlowCard";
import ShimmerButton from "../components/ui/ShimmerButton";
import {
  Calendar,
  Camera,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getMatchesForUser } from "~/lib/database";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "매치 - CoSnap" },
    { name: "description", content: "활성화된 매치와 지난 매치를 확인하세요" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Get actual user ID from session
  // For now, we'll simulate a user ID
  const userId = "mock-user-id"; // This should come from authentication

  try {
    const userMatches = await getMatchesForUser(userId);
    return {
      active: userMatches.active || [],
      past: userMatches.past || [],
    };
  } catch (error) {
    console.error("Error loading matches:", error);
    return { active: [], past: [] };
  }
}

interface MatchData {
  id: string;
  matchName: string;
  status: "scheduled" | "pending" | "completed" | "cancelled";
  dateTime: string;
  location: string;
  destination: string;
  travelDates: {
    start: string;
    end: string;
  };
  photoStyles: string[];
  focusReward: number;
  estimatedTime?: string;
}

// Adapter functions to convert database matches to UI format
const adaptActiveMatches = (dbMatches: any[]): MatchData[] => {
  return dbMatches.map((match) => ({
    id: match.id,
    matchName: "User와의 CoSnap", // TODO: Get from other user profile
    status: match.status,
    dateTime: match.scheduledAt
      ? new Date(match.scheduledAt).toLocaleString("ko-KR")
      : "시간 확정 중",
    location: match.locationHint || "장소 확정 중",
    destination: "📍 목적지", // TODO: Get from flag data
    travelDates: {
      start: "2024-01-01", // TODO: Get from flag data
      end: "2024-01-02",
    },
    photoStyles: ["사진 스타일"], // TODO: Get from profiles
    focusReward: 5, // TODO: Calculate based on user tiers
    estimatedTime: "2-3시간",
  }));
};

const adaptPastMatches = (dbMatches: any[]): MatchData[] => {
  return dbMatches.map((match) => ({
    id: match.id,
    matchName: "User와의 CoSnap", // TODO: Get from other user profile
    status: match.status,
    dateTime: match.createdAt
      ? new Date(match.createdAt).toLocaleDateString("ko-KR")
      : "",
    location: match.locationHint || "장소",
    destination: "📍 목적지", // TODO: Get from flag data
    travelDates: {
      start: "2024-01-01", // TODO: Get from flag data
      end: "2024-01-02",
    },
    photoStyles: ["사진 스타일"], // TODO: Get from profiles
    focusReward: 5, // TODO: Calculate based on completion
    estimatedTime: "2시간",
  }));
};

export default function MatchesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  // Initialize matches from loader data with adapters
  const [activeMatches, setActiveMatches] = useState<MatchData[]>(
    adaptActiveMatches(loaderData.active)
  );
  const [pastMatches, setPastMatches] = useState<MatchData[]>(
    adaptPastMatches(loaderData.past)
  );

  // Statistics
  const stats = [
    {
      title: "전체 매치",
      value: 15,
      icon: <Users className="w-5 h-5" />,
      color: "blue" as const,
      trend: { value: 25, isPositive: true },
    },
    {
      title: "완료율",
      value: 87,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green" as const,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "평균 만족도",
      value: 4.8,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple" as const,
      suffix: "/5.0",
      trend: { value: 5, isPositive: true },
    },
  ];

  const handleMessageMatch = (matchId: string) => {
    console.log("메시지 보내기:", matchId);
  };

  const handleConfirmTime = (matchId: string) => {
    console.log("시간 확인:", matchId);
  };

  const handleViewLocation = (matchId: string) => {
    console.log("위치 확인:", matchId);
  };

  const handleCancelMatch = (matchId: string) => {
    console.log("매치 취소:", matchId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            매치
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            활성화된 매치와 과거 매치 기록을 확인하세요
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 sm:mb-8">
          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 3, desktop: 3 }}
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

        {/* 탭 네비게이션 */}
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as "active" | "past")
          }
          className="mb-6 sm:mb-8"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="text-base sm:text-lg">
              활성 매치
              <Badge variant="secondary" className="ml-2">
                {activeMatches.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="text-base sm:text-lg">
              지난 매치
              <Badge variant="secondary" className="ml-2">
                {pastMatches.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeMatches.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    활성 매치가 없습니다
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    새로운 오퍼를 수락하여 첫 CoSnap을 시작해보세요!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {activeMatches.map((match, index) => (
                  <ResponsiveGridItem key={match.id} delay={index * 0.1}>
                    <MatchCard
                      {...match}
                      onMessage={() => handleMessageMatch(match.id)}
                      onConfirmTime={() => handleConfirmTime(match.id)}
                      onViewLocation={() => handleViewLocation(match.id)}
                      onCancel={() => handleCancelMatch(match.id)}
                      isCompact={false}
                    />
                  </ResponsiveGridItem>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastMatches.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    지난 매치 기록이 없습니다
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    첫 CoSnap을 완료하면 추천과 리뷰를 받을 수 있어요
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {pastMatches.map((match, index) => (
                  <ResponsiveGridItem key={match.id} delay={index * 0.1}>
                    <MatchCard
                      {...match}
                      onMessage={() => handleMessageMatch(match.id)}
                      isCompact={true}
                    />
                  </ResponsiveGridItem>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Magic UI 추천 매치 */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              추천 매치
            </h3>
            <Badge variant="outline" className="text-xs">
              ✨ Magic UI
            </Badge>
          </div>

          <GlowCard
            glowColor="rgb(59, 130, 246)"
            glowIntensity="high"
            hover={true}
            variant="gradient"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl font-bold text-gray-900">
                      🔥 인기 매치
                    </h4>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      긴급
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-4">
                    <strong>김서아 님</strong>과의 도쿄 타워 CoSnap 세션! 오늘
                    오후 3시에 가능한 동료 찾습니다. 프로 사진 작가와 함께 멋진
                    스냅 사진을 남겨보세요.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      도쿄 타워
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      오늘 오후 3시
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      Focus +10점
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <ShimmerButton
                      background="linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 100%)"
                      onClick={() => console.log("매치 수락")}
                    >
                      매치 수락하기
                    </ShimmerButton>
                    <Button
                      variant="outline"
                      onClick={() => console.log("프로필 보기")}
                    >
                      프로필 보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* CoSnap 팁 */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            CoSnap 팁
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>만나기 전날 다시 한번 시간과 장소를 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                서로의 사진 스타일과 원하는 피사체를 미리 이야기 나누세요
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>CoSnap 완료 후에는 반드시 서로 리뷰를 남겨주세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>안전한 공개 장소에서 만나는 것을 추천합니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
