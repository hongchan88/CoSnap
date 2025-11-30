import { Suspense, lazy } from "react";
import type { Route } from "./+types/_index";
import { Link, Form, useLoaderData, useNavigate } from "react-router";
import { POPULAR_DESTINATIONS } from "~/lib/constants";

const MapView = lazy(() => import("~/components/MapView"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CoSnap - 여행자들의 사진 교환 커뮤니티" },
    {
      name: "description",
      content:
        "여행자들이 서로의 사진을 찍어주는 CoSnap! 새로운 사람들을 만나고 잊지 못할 순간들을 함께 담아보세요.",
    },
  ];
}

import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags } from "~/users/queries";

export async function loader({ request }: Route.LoaderArgs) {
  const response = new Response();
  const { client } = createSupabaseClient(request);
  
  // Fetch active flags for the map
  const { flags: activeFlags = [] } = await getAllActiveFlags(client);

  console.log(activeFlags ,"flags")

  // TODO: Fetch top profiles and stats from DB
  return {
    activeFlags,
    topProfiles: [],
    stats: {
      totalActiveFlags: activeFlags.length,
      totalProfiles: 0,
      averageFocusScore: 0,
      totalCoSnaps: 0,
    },
  };
}

export default function Index() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const handleMarkerClick = (city: string) => {
    console.log("click handle marker click")
    // Navigate to explore page with location filter
    // If city is actually a country name (from country cluster), it works too
    navigate(`/explore?location=${encodeURIComponent(city)}`);
  };

  // Calculate flag counts per country
  const countryCounts = loaderData.activeFlags.reduce((acc: Record<string, number>, flag: any) => {
    const country = flag.country;
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
console.log(countryCounts,"country count")
  // Merge POPULAR_DESTINATIONS with real counts
  const heroMarkers = POPULAR_DESTINATIONS.map(dest => ({
    id: `popular-${dest.city}`,
    lat: dest.lat,
    lng: dest.lng,
    city: dest.city,
    country: dest.country,
    imageUrl: dest.imageUrl,
    count: countryCounts[dest.country_code] || 0, // Use real DB count for the country
    flags: [],
    isPopular: true
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Globe */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-gray-100" />}>
            <MapView 
              flags={heroMarkers} 
              center={{ lat: 20, lng: 150 }} 
              zoom={1.5} 
              interactive={true} 
              showControls={false}
              onMarkerClick={handleMarkerClick}
              maxZoom={4}
              minZoom={1.5}
              maxBounds={[[-90, -180], [90, 180]]}
              noWrap={false}
              clusteringThreshold={10} // Always show country clusters on home page
            />
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 pointer-events-none" />
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CoSnap은 이렇게 작동해요
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              간단한 4단계로 새로운 여행 경험을 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚩</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Flag 생성</h3>
              <p className="text-gray-600 text-sm">
                여행 계획을 Flag로 등록하고 다른 여행자들에게 알리세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Offer 교환</h3>
              <p className="text-gray-600 text-sm">
                마음에 드는 여행자에게 오퍼를 보내거나 받으세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Match 성사</h3>
              <p className="text-gray-600 text-sm">
                오퍼가 수락되면 매치가 확정되고 만남을 약속해요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Focus 획득</h3>
              <p className="text-gray-600 text-sm">
                성공적인 CoSnap 후 서로 리뷰를 남기고 Focus를 쌓아요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 CoSnap인가요?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              신뢰 기반의 커뮤니티에서 안전하고 즐거운 여행 경험을 만나보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Focus 시스템</h3>
              <p className="text-gray-600 mb-4">
                신뢰도 점수로 안전한 커뮤니티를 구축합니다. 성공적인
                CoSnap일수록 Focus가 올라가요.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blurry → Focusing → Clear → Crystal</li>
                <li>• 높은 Focus 사용자는 더 많은 기회</li>
                <li>• 투명한 신뢰도 평가 시스템</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">계획 기반 매칭</h3>
              <p className="text-gray-600 mb-4">
                여행 계획을 미리 공유하고 신중하게 파트너를 선택하세요. 실시간
                매칭보다 더 안전하고 깊이 있는 교류가 가능해요.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 여행지와 날짜 기반 매칭</li>
                <li>• 충분한 소통 시간</li>
                <li>• 상호 검증 프로세스</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">프리미엄 혜택</h3>
              <p className="text-gray-600 mb-4">
                프리미엄으로 더 많은 기회와 편리함을 누리세요. 언제든지 여행
                계획을 만들고 수정할 수 있어요.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 무제한 오퍼 발송</li>
                <li>• 언제든지 Flag 생성 및 수정</li>
                <li>• AI 사진 합성 기능 (추가 예정)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Active Flags from Database */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              현재 활성화된 여행 계획
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              다른 여행자들의 실제 여행 계획을 확인하고 CoSnap을 신청해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loaderData.activeFlags.map((flag: any) => (
              <div
                key={flag.id}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📍</span>
                      <h3 className="font-semibold text-gray-900">
                        {flag.city}, {flag.country}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(flag.startDate).toLocaleDateString("ko-KR")} -{" "}
                      {new Date(flag.endDate).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {flag.profile && (
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {flag.profile.username}
                      </div>
                      <div className="text-xs text-blue-600">
                        Focus: {flag.profile.focusScore}
                      </div>
                    </div>
                  )}
                </div>
                {flag.note && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {flag.note}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flag.sourcePlanType === "premium"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {flag.sourcePlanType === "premium" ? "프리미엄" : "일반"}
                  </span>
                  <Link
                    to="/flags"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {loaderData.activeFlags.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-500 mb-4">
                아직 활성화된 여행 계획이 없습니다
              </p>
              <Link
                to="/flags"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                첫 여행 계획 만들기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Profiles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top CoSnap 사용자
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              높은 Focus 점수를 보유한 신뢰할 수 있는 사용자들
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loaderData.topProfiles.map((profile: any) => (
              <div
                key={profile.id}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📸</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {profile.username}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600 font-medium">
                        Focus: {profile.focusScore}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          profile.focusTier === "Crystal"
                            ? "bg-purple-100 text-purple-800"
                            : profile.focusTier === "Clear"
                              ? "bg-green-100 text-green-800"
                              : profile.focusTier === "Focusing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {profile.focusTier}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.role === "premium"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {profile.role === "premium" ? "프리미엄" : "일반"}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {profile.cameraGear && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">장비:</span>
                      <span className="text-gray-700">
                        {profile.cameraGear}
                      </span>
                    </div>
                  )}
                  {profile.styles && profile.styles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">스타일:</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.styles
                          .slice(0, 2)
                          .map((style: string, index: number) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {style}
                            </span>
                          ))}
                        {profile.styles.length > 2 && (
                          <span className="text-gray-500 text-xs">
                            +{profile.styles.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">언어:</span>
                      <span className="text-gray-700">
                        {profile.languages.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CoSnap 사용자 후기
            </h2>
            <p className="text-gray-600">실제 사용자들의 생생한 경험담</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-semibold">김민준</div>
                  <div className="text-sm text-gray-500">Focus: Crystal</div>
                </div>
              </div>
              <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 text-sm">
                "일본 여행에서 CoSnap으로 멋진 사람들을 만났어요. 서로의 사진
                스타일을 존중해주면서도 즐거운 시간을 보냈습니다. 덕분에 여행
                사진이 훨씬 풍성해졌어요!"
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-semibold">이서아</div>
                  <div className="text-sm text-gray-500">Focus: Clear</div>
                </div>
              </div>
              <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 text-sm">
                "처음에는 걱정도 됐는데, Focus 시스템 덕분에 신뢰할 수 있는
                사람들을 만날 수 있었어요. 이제는 여행 갈 때마다 CoSnap은
                필수예요!"
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-semibold">박철민</div>
                  <div className="text-sm text-gray-500">Focus: Focusing</div>
                </div>
              </div>
              <div className="text-yellow-400 mb-3">⭐⭐⭐⭐</div>
              <p className="text-gray-700 text-sm">
                "혼자 여행할 때 외롭지 않게 해줘요. 같은 장소에 있는 여행자들과
                자연스럽게 어울릴 수 있고, 좋은 사진도 얻고 친구도 생겼어요."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            당신의 다음 여행에 CoSnap을 더하세요
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            새로운 사람들을 만나고 잊지 못할 순간들을 함께 담아보세요. 지금 바로
            여행 계획을 만들어보세요!
          </p>
          <Link
            to="/flags"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
