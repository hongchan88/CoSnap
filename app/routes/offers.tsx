import type { Route } from "./+types/offers";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "오퍼 - CoSnap" },
    { name: "description", content: "받은 오퍼와 보낸 오퍼를 관리하세요" },
  ];
}

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">오퍼</h1>
          <p className="text-gray-600">여행자들과의 교류를 시작하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="py-3 px-6 border-b-2 border-blue-500 text-blue-600 font-medium">
                받은 오퍼 (3)
              </button>
              <button className="py-3 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                보낸 오퍼 (2)
              </button>
            </nav>
          </div>
        </div>

        {/* 받은 오퍼 목록 */}
        <div className="space-y-4">
          {/* 새 오퍼 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">김민준</h3>
                  <p className="text-sm text-gray-500">Focus: Crystal (85점)</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">새 오퍼</span>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">🇯🇵 도쿄, 오사카 여행</h4>
              <p className="text-gray-600 mb-2">2024년 11월 15일 - 2024년 11월 25일</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                "안녕하세요! 같은 기간에 일본 여행을 계획하고 있습니다.
                신주쿠와 시부야에서 멋진 스냅 사진 함께 찍을까요?
                저는 풍경 사진에 자신있습니다!"
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                수락하기
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                거절하기
              </button>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                프로필 보기
              </button>
            </div>
          </div>

          {/* 기존 오퍼 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">이서아</h3>
                  <p className="text-sm text-gray-500">Focus: Clear (65점)</p>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">어제</span>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">🇯🇵 도쿄, 오사카 여행</h4>
              <p className="text-gray-600 mb-2">2024년 11월 15일 - 2024년 11월 25일</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                "안녕하세요! 오사카 성과 도톤보리에서 멋진 사진 찍어드릴게요.
                밤 사진 전문이라 야경 촬영 도와드릴 수 있어요!"
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                수락하기
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                거절하기
              </button>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                프로필 보기
              </button>
            </div>
          </div>

          {/* 이미 응답한 오퍼 */}
          <div className="bg-white rounded-xl shadow-sm p-6 opacity-75">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">박철민</h3>
                  <p className="text-sm text-gray-500">Focus: Focusing (35점)</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">수락됨</span>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">🇰🇷 서울, 부산 여행</h4>
              <p className="text-gray-600 mb-2">2024년 12월 1일 - 2024년 12월 7일</p>
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg">
                ✅ 매치가 성사되었습니다! <span className="text-sm">12월 3일 오후 2시, 명동역에서 만나기로 함</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                매치 상세 보기
              </button>
              <button className="text-gray-600 hover:text-gray-800 font-medium">
                메시지 보내기
              </button>
            </div>
          </div>
        </div>

        {/* 프리미엄 오퍼 제한 안내 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">프리미엄 오퍼 제한</h3>
              <p className="text-gray-700 text-sm">
                무료 사용자는 주당 3개의 오퍼만 보낼 수 있습니다.
                프리미엄으로 업그레이드하여 무제한 오퍼를 보내세요.
              </p>
              <button className="mt-3 text-yellow-700 hover:text-yellow-800 font-medium text-sm">
                프리미엄 알아보기 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}