import type { Route } from "./+types/flags";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "내 여행 계획 - CoSnap" },
    { name: "description", content: "여행 계획(Flag)을 생성하고 관리하세요" },
  ];
}

export default function FlagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 여행 계획</h1>
          <p className="text-gray-600">여행 계획을 공유하고 멋진 사진 교환을 시작하세요</p>
        </div>

        <div className="mb-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 여행 계획 만들기
          </button>
        </div>

        <div className="space-y-6">
          {/* Flag 목록 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">예정된 여행</h2>

            {/* 샘플 Flag 카드 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🇯🇵 도쿄, 오사카</h3>
                  <p className="text-gray-600 mb-3">2024년 11월 15일 - 2024년 11월 25일</p>
                  <p className="text-sm text-gray-500">사진 스타일: 인물, 풍경, 거리 사진</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">활성</span>
                    <span className="text-sm text-gray-500">받은 오퍼: 3개</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 추가 샘플 Flag */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors mt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🇰🇷 서울, 부산</h3>
                  <p className="text-gray-600 mb-3">2024년 12월 1일 - 2024년 12월 7일</p>
                  <p className="text-sm text-gray-500">사진 스타일: 도시, 야경, 음식</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">활성</span>
                    <span className="text-sm text-gray-500">받은 오퍼: 1개</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 과거 여행 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">지난 여행</h2>
            <p className="text-gray-500 text-center py-8">지난 여행 기록이 없습니다</p>
          </div>
        </div>

        {/* 프리미엄 업그레이드 배너 */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">프리미엄으로 업그레이드</h3>
              <p className="text-blue-100">언제든지 여행 계획을 만들고 수정하세요</p>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              알아보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}