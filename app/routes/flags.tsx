import type { Route } from "./+types/flags";
import { useState } from "react";
import FlagForm from "../components/FlagForm";
import FlagCard from "../components/FlagCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Notification from "../components/ui/Notification";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "내 여행 계획 - CoSnap" },
    { name: "description", content: "여행 계획(Flag)을 생성하고 관리하세요" },
  ];
}

interface FlagData {
  id: string;
  city: string;
  country: string;
  flag: string;
  startDate: string;
  endDate: string;
  note: string;
  status: 'active' | 'hidden' | 'expired';
  offerCount: number;
  styles: string[];
  languages: string[];
}

export default function FlagsPage() {
  const [isCreatingFlag, setIsCreatingFlag] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FlagData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 실시간 Flag 목록 (시뮬레이션)
  const [flags, setFlags] = useState<FlagData[]>([
    {
      id: '1',
      city: '도쿄, 오사카',
      country: 'JP',
      flag: '🇯🇵',
      startDate: '2024-11-15',
      endDate: '2024-11-25',
      note: '신주쿠, 시부야, 오사카 성, 도톤보리 등 주요 관광지 방문 예정',
      status: 'active',
      offerCount: 3,
      styles: ['인물 사진', '풍경 사진', '거리 사진'],
      languages: ['ko', 'ja', 'en'],
    },
    {
      id: '2',
      city: '서울, 부산',
      country: 'KR',
      flag: '🇰🇷',
      startDate: '2024-12-01',
      endDate: '2024-12-07',
      note: '겨울 서울과 부산의 매력을 담아보고 싶어요',
      status: 'active',
      offerCount: 1,
      styles: ['도시', '야경', '음식'],
      languages: ['ko', 'en'],
    },
  ]);

  const getCountryFlag = (countryCode: string): string => {
    const flags: { [key: string]: string } = {
      'JP': '🇯🇵',
      'KR': '🇰🇷',
      'US': '🇺🇸',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'GB': '🇬🇧',
      'CN': '🇨🇳',
      'TH': '🇹🇭',
      'VN': '🇻🇳',
      'TW': '🇹🇼',
    };
    return flags[countryCode] || '🌍';
  };

  const getCountryName = (countryCode: string): string => {
    const names: { [key: string]: string } = {
      'JP': '일본',
      'KR': '한국',
      'US': '미국',
      'FR': '프랑스',
      'IT': '이탈리아',
      'GB': '영국',
      'CN': '중국',
      'TH': '태국',
      'VN': '베트남',
      'TW': '대만',
    };
    return names[countryCode] || countryCode;
  };

  const handleCreateFlag = async (formData: any) => {
    setIsLoading(true);

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newFlag: FlagData = {
        id: Date.now().toString(),
        city: formData.city,
        country: formData.country,
        flag: getCountryFlag(formData.country),
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note,
        status: 'active',
        offerCount: 0,
        styles: formData.photoStyles,
        languages: formData.languages,
      };

      setFlags(prev => [newFlag, ...prev]);
      setIsCreatingFlag(false);

    } catch (error) {
      throw new Error('Flag 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlag = async (formData: any) => {
    if (!editingFlag) return;

    setIsLoading(true);

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedFlag: FlagData = {
        ...editingFlag,
        city: formData.city,
        country: formData.country,
        flag: getCountryFlag(formData.country),
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note,
        styles: formData.photoStyles,
        languages: formData.languages,
      };

      setFlags(prev =>
        prev.map(flag =>
          flag.id === editingFlag.id ? updatedFlag : flag
        )
      );

      setEditingFlag(null);

    } catch (error) {
      throw new Error('Flag 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlag = async (flagId: string) => {
    if (!confirm('정말로 이 Flag를 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFlags(prev => prev.filter(flag => flag.id !== flagId));
      setNotification({ type: 'success', message: 'Flag가 삭제되었습니다.' });

    } catch (error) {
      setNotification({ type: 'error', message: 'Flag 삭제에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlagClick = (flag: FlagData) => {
    setEditingFlag(flag);
    setIsCreatingFlag(true);
  };

  const activeFlags = flags.filter(flag => flag.status === 'active');
  const pastFlags = flags.filter(flag => flag.status === 'expired' || new Date(flag.endDate) < new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 여행 계획</h1>
          <p className="text-gray-600">여행 계획을 공유하고 멋진 사진 교환을 시작하세요</p>
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

        {/* Flag 생성/편집 폼 */}
        {isCreatingFlag && (
          <div className="mb-8">
            <FlagForm
              onSubmit={editingFlag ? handleEditFlag : handleCreateFlag}
              onCancel={() => {
                setIsCreatingFlag(false);
                setEditingFlag(null);
              }}
              initialData={editingFlag ? {
                city: editingFlag.city.split(', ')[0],
                country: editingFlag.country,
                startDate: editingFlag.startDate,
                endDate: editingFlag.endDate,
                note: editingFlag.note,
                photoStyles: editingFlag.styles,
                languages: editingFlag.languages,
              } : undefined}
              isEditing={!!editingFlag}
            />
          </div>
        )}

        {/* 새 Flag 만들기 버튼 */}
        {!isCreatingFlag && (
          <div className="mb-8">
            <button
              onClick={() => setIsCreatingFlag(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  처리 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 여행 계획 만들기
                </>
              )}
            </button>
          </div>
        )}

        {/* 활성 Flag 목록 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">예정된 여행 ({activeFlags.length})</h2>

            {activeFlags.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">예정된 여행 계획이 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">새로운 Flag를 만들어 여행 계획을 공유해보세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFlags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    id={flag.id}
                    destination={flag.city}
                    country={getCountryName(flag.country)}
                    flag={flag.flag}
                    startDate={flag.startDate}
                    endDate={flag.endDate}
                    status={flag.status}
                    offerCount={flag.offerCount}
                    styles={flag.styles}
                    note={flag.note}
                    canEdit={true}
                    onEdit={() => handleEditFlagClick(flag)}
                    onDelete={() => handleDeleteFlag(flag.id)}
                    onViewOffers={() => {
                      // 오퍼 페이지로 이동
                      window.location.href = '/offers';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 지난 여행 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">지난 여행 ({pastFlags.length})</h2>

            {pastFlags.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">지난 여행 기록이 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">첫 CoSnap을 시작해보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastFlags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    id={flag.id}
                    destination={flag.city}
                    country={getCountryName(flag.country)}
                    flag={flag.flag}
                    startDate={flag.startDate}
                    endDate={flag.endDate}
                    status={flag.status}
                    offerCount={flag.offerCount}
                    styles={flag.styles}
                    note={flag.note}
                    canEdit={false}
                  />
                ))}
              </div>
            )}
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