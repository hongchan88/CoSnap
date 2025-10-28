import type { Route } from "./+types/profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "프로필 - CoSnap" },
    { name: "description", content: "프로필을 관리하고 Focus 점수를 확인하세요" },
  ];
}

export default function ProfilePage() {
  const focusScore = 65;
  const focusTier = "Clear";
  const nextTierScore = 81;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필</h1>
          <p className="text-gray-600">프로필 정보를 관리하고 CoSnap 활동을 확인하세요</p>
        </div>

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">홍길동</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  프리미엄
                </span>
              </div>
              <p className="text-gray-600 mb-4">@hongtravel • 서울, 한국</p>
              <p className="text-gray-700 mb-4">
                여행을 사랑하는 사진 작가입니다. 새로운 사람들을 만나고 멋진 순간들을 함께 담는 것을 좋아해요.
                주로 풍경과 스냅 사진을 찍습니다!
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">풍경 사진</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">인물 사진</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">도시 탐험</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">한국어, 영어</span>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                프로필 편집
              </button>
            </div>
          </div>
        </div>

        {/* Focus 점수 섹션 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Focus 점수</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Focus 시스템 알아보기
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{focusScore}</div>
                  <div className="text-white text-sm">{focusTier}</div>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              다음 티어까지 <span className="font-semibold text-blue-600">{nextTierScore - focusScore}점</span> 필요
            </p>
          </div>

          {/* Focus 진행바 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Blurry (0-20)</span>
              <span>Focusing (21-50)</span>
              <span>Clear (51-80)</span>
              <span>Crystal (81+)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                   style={{ width: `${(focusScore / 100) * 100}%` }}></div>
              <div className="absolute top-1/2 transform -translate-y-1/2"
                   style={{ left: `${(focusScore / 100) * 100}%`, marginLeft: '-8px' }}>
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Focus 히스토리 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">최근 활동</h4>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-green-600">+5</span>
                <span className="text-sm text-gray-700">박철민 님과 CoSnap 완료</span>
              </div>
              <span className="text-sm text-gray-500">2일 전</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-green-600">+5</span>
                <span className="text-sm text-gray-700">이서아 님으로부터 긍정 리뷰</span>
              </div>
              <span className="text-sm text-gray-500">5일 전</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">+10</span>
                <span className="text-sm text-gray-700">프리미엄 보너스 (월간)</span>
              </div>
              <span className="text-sm text-gray-500">1주 전</span>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-gray-600">완료된 CoSnap</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
            <div className="text-gray-600">평균 리뷰 점수</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-gray-600">방문한 도시</div>
          </div>
        </div>

        {/* 장비 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">사진 장비</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Canon EOS R6</div>
                <div className="text-sm text-gray-500">메인 카메라</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">iPhone 15 Pro</div>
                <div className="text-sm text-gray-500">모바일 촬영</div>
              </div>
            </div>
          </div>
        </div>

        {/* 설정 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">알림 설정</div>
                <div className="text-sm text-gray-500">새 오퍼, 메시지, 매치 알림</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">개인정보 보호</div>
                <div className="text-sm text-gray-500">프로필 공개 설정, 데이터 관리</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">구독 관리</div>
                <div className="text-sm text-gray-500">프리미엄 구독, 결제 정보</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-red-600">로그아웃</div>
                <div className="text-sm text-gray-500">계정에서 로그아웃</div>
              </div>
              <button className="text-red-600 hover:text-red-800">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}