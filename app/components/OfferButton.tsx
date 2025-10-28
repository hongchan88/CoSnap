interface OfferButtonProps {
  flagId: string;
  flagOwnerId: string;
  status?: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'none';
  onSendOffer?: () => void;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
  onCancelOffer?: () => void;
  disabled?: boolean;
  isOwnFlag?: boolean;
  offerCount?: number;
}

export default function OfferButton({
  flagId,
  flagOwnerId,
  status = 'none',
  onSendOffer,
  onAcceptOffer,
  onDeclineOffer,
  onCancelOffer,
  disabled = false,
  isOwnFlag = false,
  offerCount = 0,
}: OfferButtonProps) {
  if (isOwnFlag) {
    // 자신의 Flag인 경우 - 오퍼 관리
    if (offerCount === 0) {
      return (
        <div className="text-sm text-gray-500 text-center py-2">
          아직 받은 오퍼가 없습니다
        </div>
      );
    }

    return (
      <button
        onClick={() => window.location.href = '/offers'}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        오퍼 {offerCount}개 보기
      </button>
    );
  }

  // 다른 사람의 Flag인 경우 - 오퍼 보내기
  switch (status) {
    case 'none':
      return (
        <button
          onClick={onSendOffer}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          오퍼 보내기
        </button>
      );

    case 'pending':
      return (
        <div className="space-y-2">
          <div className="text-sm text-yellow-600 text-center bg-yellow-50 p-2 rounded-lg">
            ⏰ 오퍼 응답 대기 중
          </div>
          <button
            onClick={onCancelOffer}
            className="w-full border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            오퍼 취소하기
          </button>
        </div>
      );

    case 'accepted':
      return (
        <div className="text-sm text-green-600 text-center bg-green-50 p-3 rounded-lg">
          ✅ 오퍼가 수락되었습니다!<br />
          <span className="text-xs">매치 페이지에서 확인하세요</span>
        </div>
      );

    case 'declined':
      return (
        <div className="space-y-2">
          <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
            ❌ 오퍼가 거절되었습니다
          </div>
          <button
            onClick={onSendOffer}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            다시 오퍼 보내기
          </button>
        </div>
      );

    case 'expired':
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 text-center bg-gray-50 p-2 rounded-lg">
            ⏰ 오퍼가 만료되었습니다
          </div>
          <button
            onClick={onSendOffer}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            새 오퍼 보내기
          </button>
        </div>
      );

    case 'cancelled':
      return (
        <button
          onClick={onSendOffer}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          오퍼 다시 보내기
        </button>
      );

    default:
      return null;
  }
}

// 오퍼 응답 버튼 컴포넌트 (Flag 소유자용)
export function OfferResponseButtons({
  onAccept,
  onDecline,
  disabled = false,
}: {
  onAccept: () => void;
  onDecline: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAccept}
        disabled={disabled}
        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        수락하기
      </button>
      <button
        onClick={onDecline}
        disabled={disabled}
        className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        거절하기
      </button>
    </div>
  );
}