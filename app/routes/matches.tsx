import type { Route } from "./+types/matches";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "매치 - CoSnap" },
    { name: "description", content: "활성화된 매치와 지난 매치를 확인하세요" },
  ];
}

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">매치</h1>
          <p className="text-gray-600">활성화된 매치와 과거 매치 기록을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="py-3 px-6 border-b-2 border-blue-500 text-blue-600 font-medium">
                활성 매치 (1)
              </button>
              <button className="py-3 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                지난 매치 (0)
              </button>
            </nav>
          </div>
        </div>

        {/* 활성 매치 */}
        <div className="space-y-6">
          {/* 예정된 매치 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">박철민 님과의 CoSnap</h3>
                  <p className="text-sm text-gray-500">2024년 12월 3일 오후 2:00</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">예정됨</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">📍</span>
                <span className="text-sm text-gray-700">서울특별시 중구 명동역 1번 출구</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🇰🇷 서울, 부산 여행</h4>
                <p className="text-sm text-gray-600 mb-3">2024년 12월 1일 - 2024년 12월 7일</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">사진 스타일:</span>
                    <span>도시, 야경, 음식 사진</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">예상 시간:</span>
                    <span>2-3시간</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Focus 보상:</span>
                    <span className="text-green-600 font-medium">+5점 (완료 시)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                메시지 보내기
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                위치 확인
              </button>
              <button className="text-red-600 hover:text-red-800 font-medium">
                매치 취소
              </button>
            </div>
          </div>

          {/* 확인 대기 중인 매치 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">김민준 님과의 CoSnap</h3>
                  <p className="text-sm text-gray-500">시간 확정 중</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">확인 대기</span>
            </div>

            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-3">
                <p className="text-sm text-yellow-800">
                  ⏰ 시간 조율이 필요합니다. 서로 가능한 시간을 제안해주세요.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🇯🇵 도쿄, 오사카 여행</h4>
                <p className="text-sm text-gray-600 mb-3">2024년 11월 15일 - 2024년 11월 25일</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">희망 장소:</span>
                    <span>신주쿠, 시부야</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">상대방 제안:</span>
                    <span>11월 18일 오후 3시 또는 19일 오전 11시</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                시간 제안하기
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                메시지 보내기
              </button>
              <button className="text-red-600 hover:text-red-800 font-medium">
                매치 취소
              </button>
            </div>
          </div>
        </div>

        {/* 지난 매치 섹션 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">지난 매치</h2>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">지난 매치 기록이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">첫 CoSnap을 시작해보세요!</p>
          </div>
        </div>

        {/* 매치 팁 */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            CoSnap 팁
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>만나기 전날 다시 한번 시간과 장소를 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>서로의 사진 스타일과 원하는 피사체를 미리 이야기 나누세요</span>
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