import { Suspense, lazy, useRef } from "react";
import type { Route } from "./+types/_index";
import { Link, Form, useLoaderData, useNavigate, Await } from "react-router";
import { POPULAR_DESTINATIONS } from "~/lib/constants";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ClientOnly } from "~/components/ClientOnly";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getTopProfiles, getCommunityStats } from "~/users/queries";
import { useLanguage } from "~/context/language-context";
import { Skeleton } from "~/components/ui/skeleton";

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

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = createSupabaseClient(request);

  // Defer all data fetching
  const dataPromise = (async () => {
    try {
      const [
        { flags: activeFlags = [] },
        { profiles: topProfiles = [] },
        { stats }
      ] = await Promise.all([
        getAllActiveFlags(client),
        getTopProfiles(client),
        getCommunityStats(client)
      ]);

      return {
        activeFlags,
        topProfiles,
        stats: stats || {
          totalActiveFlags: activeFlags.length,
          totalProfiles: 0,
          averageFocusScore: 0,
          totalCoSnaps: 0,
        }
      };
    } catch (error) {
      console.error("Home loader error:", error);
      return {
        activeFlags: [],
        topProfiles: [],
        stats: {
          totalActiveFlags: 0,
          totalProfiles: 0,
          averageFocusScore: 0,
          totalCoSnaps: 0,
        }
      };
    }
  })();

  return { data: dataPromise };
}

function HomeContent({ data }: { data: any }) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { activeFlags, topProfiles, stats } = data;

  const handleMarkerClick = (city: string) => {
    console.log("click handle marker click");
    // Navigate to explore page with location filter
    // If city is actually a country name (from country cluster), it works too
    navigate(`/explore?location=${encodeURIComponent(city)}`);
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate flag counts per country
  const countryCounts = activeFlags.reduce(
    (acc: Record<string, number>, flag: any) => {
      const country = flag.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {}
  );
  
  // Merge POPULAR_DESTINATIONS with real counts
  const heroMarkers = POPULAR_DESTINATIONS.map((dest) => ({
    id: `popular-${dest.city}`,
    lat: dest.lat,
    lng: dest.lng,
    city: dest.city,
    country: dest.country,
    imageUrl: dest.imageUrl,
    count: countryCounts[dest.country_code] || 0, // Use real DB count for the country
    flags: [],
    isPopular: true,
  }));

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    viewport: { once: false, amount: 0.3 },
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Globe - Full Screen */}
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ClientOnly fallback={<div className="w-full h-full bg-gray-100" />}>
            {() => (
              <Suspense
                fallback={<div className="w-full h-full bg-gray-100" />}
              >
                <MapView
                  flags={heroMarkers}
                  center={{ lat: 20, lng: 150 }}
                  zoom={1.5}
                  interactive={true}
                  showControls={false}
                  onMarkerClick={handleMarkerClick}
                  maxZoom={18}
                  minZoom={1.5}
                  maxBounds={[
                    [-90, -180],
                    [90, 180],
                  ]}
                  noWrap={false}
                  clusteringThreshold={10} // Always show country clusters on home page
                />
              </Suspense>
            )}
          </ClientOnly>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 pointer-events-none" />

          {/* Scroll Down Indicator */}
          <div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce cursor-pointer"
            onClick={scrollToContent}
          >
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white transition-colors">
              <ChevronDown className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section ref={contentRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t ? t("home.howItWorks.title") : "CoSnap은 이렇게 작동해요"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t
                ? t("home.howItWorks.subtitle")
                : "간단한 4단계로 새로운 여행 경험을 시작하세요"}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false, amount: 0.3 }}
          >
            {[
              {
                icon: "🚩",
                title: t ? t("home.howItWorks.step1.title") : "Flag 생성",
                desc: t
                  ? t("home.howItWorks.step1.desc")
                  : "여행 계획을 Flag로 등록하고 다른 여행자들에게 알리세요",
              },
              {
                icon: "💌",
                title: t ? t("home.howItWorks.step2.title") : "Offer 교환",
                desc: t
                  ? t("home.howItWorks.step2.desc")
                  : "마음에 드는 여행자에게 오퍼를 보내거나 받으세요",
              },
              {
                icon: "🤝",
                title: t ? t("home.howItWorks.step3.title") : "Match 성사",
                desc: t
                  ? t("home.howItWorks.step3.desc")
                  : "오퍼가 수락되면 매치가 확정되고 만남을 약속해요",
              },
              {
                icon: "⭐",
                title: t ? t("home.howItWorks.step4.title") : "Focus 획득",
                desc: t
                  ? t("home.howItWorks.step4.desc")
                  : "성공적인 CoSnap 후 서로 리뷰를 남기고 Focus를 쌓아요",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t ? t("home.whyCoSnap.title") : "왜 CoSnap인가요?"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t
                ? t("home.whyCoSnap.subtitle")
                : "신뢰 기반의 커뮤니티에서 안전하고 즐거운 여행 경험을 만나보세요"}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              variants={fadeInUp}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                {t("home.whyCoSnap.focus.title")}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("home.whyCoSnap.focus.desc")}
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Blurry → Focusing → Clear → Crystal
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  높은 Focus 사용자는 더 많은 기회
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  투명한 신뢰도 평가 시스템
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              variants={fadeInUp}
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                {t("home.whyCoSnap.planning.title")}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("home.whyCoSnap.planning.desc")}
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  여행지와 날짜 기반 매칭
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  충분한 소통 시간
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  상호 검증 프로세스
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              variants={fadeInUp}
            >
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                {t("home.whyCoSnap.premium.title")}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("home.whyCoSnap.premium.desc")}
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  무제한 오퍼 발송
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  언제든지 Flag 생성 및 수정
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  AI 사진 합성 기능 (추가 예정)
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Active Flags from Database */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t ? t("home.activeFlags.title") : "현재 활성화된 여행 계획"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t
                ? t("home.activeFlags.subtitle")
                : "다른 여행자들의 실제 여행 계획을 확인하고 CoSnap을 신청해보세요"}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false, amount: 0.3 }}
          >
            {activeFlags.map((flag: any) => (
              <motion.div
                key={flag.id}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                variants={fadeInUp}
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
                    {flag.sourcePlanType === "premium"
                      ? t("home.activeFlags.premium")
                      : t("home.activeFlags.regular")}
                  </span>
                  <Link
                    to="/flags"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t ? t("home.activeFlags.viewDetails") : "자세히 보기 →"}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {activeFlags.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-500 mb-4">
                {t
                  ? t("home.activeFlags.noFlags")
                  : "아직 활성화된 여행 계획이 없습니다"}
              </p>
              <Link
                to="/flags"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t ? t("home.activeFlags.createFirst") : "첫 여행 계획 만들기"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Profiles */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t ? t("home.topProfiles.title") : "Top CoSnap 사용자"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t
                ? t("home.topProfiles.subtitle")
                : "높은 Focus 점수를 보유한 신뢰할 수 있는 사용자들"}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false, amount: 0.3 }}
          >
            {topProfiles.map((profile: any) => (
              <motion.div
                key={profile.id}
                className="bg-white rounded-xl p-6 shadow-sm"
                variants={fadeInUp}
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
                    {profile.role === "premium"
                      ? t("home.activeFlags.premium")
                      : t("home.activeFlags.regular")}
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
                      <span className="text-gray-500">
                        {t("home.topProfiles.equipment")}
                      </span>
                      <span className="text-gray-700">
                        {profile.cameraGear}
                      </span>
                    </div>
                  )}
                  {profile.styles && profile.styles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        {t("home.topProfiles.style")}
                      </span>
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
                      <span className="text-gray-500">
                        {t("home.topProfiles.languages")}
                      </span>
                      <span className="text-gray-700">
                        {profile.languages.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t ? t("home.testimonials.title") : "CoSnap 사용자 후기"}
            </h2>
            <p className="text-gray-600">
              {t
                ? t("home.testimonials.subtitle")
                : "실제 사용자들의 생생한 경험담"}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.div
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeInUp}
            >
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
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeInUp}
            >
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
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeInUp}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("home.cta.title")}
          </h2>
          <p className="text-blue-100 text-lg mb-8">{t("home.cta.subtitle")}</p>
          <Link
            to="/flags"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            {t ? t("home.cta.getStarted") : "무료로 시작하기"}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <div className="relative h-screen w-full overflow-hidden bg-gray-50">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-x-0 bottom-24 flex justify-center z-10">
                     <Skeleton className="h-12 w-64 rounded-full" />
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-24">
                 <div className="flex justify-center mb-16">
                     <Skeleton className="h-10 w-64" />
                 </div>
                 <div className="grid md:grid-cols-4 gap-8">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <Skeleton className="h-20 w-20 rounded-2xl mb-6" />
                             <Skeleton className="h-6 w-32 mb-3" />
                             <Skeleton className="h-4 w-48" />
                        </div>
                     ))}
                 </div>
            </div>
        </div>
    )
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  
    return (
        <Suspense fallback={<HomeSkeleton />}>
        <Await resolve={data}>
            {(resolvedData) => <HomeContent data={resolvedData} />}
        </Await>
        </Suspense>
    );
}
