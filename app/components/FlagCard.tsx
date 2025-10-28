interface FlagCardProps {
  id: string;
  destination: string;
  country: string;
  flag: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'hidden' | 'expired';
  offerCount: number;
  styles: string[];
  note?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewOffers?: () => void;
}

export default function FlagCard({
  id,
  destination,
  country,
  flag,
  startDate,
  endDate,
  status,
  offerCount,
  styles,
  note,
  canEdit = false,
  onEdit,
  onDelete,
  onViewOffers,
}: FlagCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    hidden: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  const statusText = {
    active: '활성',
    hidden: '숨김',
    expired: '만료',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{flag}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {destination}, {country}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(startDate).toLocaleDateString('ko-KR')} - {new Date(endDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
            {statusText[status]}
          </span>
        </div>

        {/* 메모 */}
        {note && (
          <div className="mb-4">
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
              {note}
            </p>
          </div>
        )}

        {/* 사진 스타일 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">선호 사진 스타일</h4>
          <div className="flex flex-wrap gap-2">
            {styles.map((style, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {style}
              </span>
            ))}
          </div>
        </div>

        {/* 오퍼 정보 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">받은 오퍼</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">{offerCount}개</span>
          </div>
          {offerCount > 0 && (
            <button
              onClick={onViewOffers}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              오퍼 보기 →
            </button>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {canEdit && (
            <>
              <button
                onClick={onEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                수정하기
              </button>
              <button
                onClick={onDelete}
                className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
              >
                삭제하기
              </button>
            </>
          )}
          {!canEdit && status === 'active' && (
            <button
              onClick={onViewOffers}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              오퍼 보기 ({offerCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}