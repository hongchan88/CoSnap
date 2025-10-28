interface FocusMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
  showProgress?: boolean;
  animated?: boolean;
}

const focusTiers = [
  { name: 'Blurry', min: 0, max: 20, color: 'from-gray-400 to-gray-600', textColor: 'text-gray-600' },
  { name: 'Focusing', min: 21, max: 50, color: 'from-blue-400 to-blue-600', textColor: 'text-blue-600' },
  { name: 'Clear', min: 51, max: 80, color: 'from-yellow-400 to-orange-500', textColor: 'text-orange-600' },
  { name: 'Crystal', min: 81, max: 100, color: 'from-purple-400 to-pink-500', textColor: 'text-purple-600' },
];

export default function FocusMeter({
  score,
  size = 'md',
  showTier = true,
  showProgress = false,
  animated = true,
}: FocusMeterProps) {
  const currentTier = focusTiers.find(tier => score >= tier.min && score <= tier.max) || focusTiers[0];
  const nextTier = focusTiers.find(tier => score < tier.min);

  const sizeClasses = {
    sm: { container: 'w-16 h-16', score: 'text-lg', tier: 'text-xs' },
    md: { container: 'w-24 h-24', score: 'text-2xl', tier: 'text-sm' },
    lg: { container: 'w-32 h-32', score: 'text-3xl', tier: 'text-base' },
  };

  const currentSize = sizeClasses[size];
  const progressPercentage = (score / 100) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* 원형 Focus 미터 */}
      <div className={`relative ${currentSize.container} rounded-full bg-gradient-to-br ${currentTier.color} flex items-center justify-center ${animated ? 'animate-pulse' : ''}`}>
        <div className="bg-white rounded-full w-5/6 h-5/6 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${currentSize.score} ${currentTier.textColor}`}>
              {score}
            </div>
            {showTier && (
              <div className={`font-medium ${currentSize.tier} ${currentTier.textColor}`}>
                {currentTier.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      {showProgress && (
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            {focusTiers.map((tier, index) => (
              <span key={index} className={score >= tier.min ? currentTier.textColor : ''}>
                {tier.name}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 relative">
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${currentTier.color} transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
            >
              <div className="w-3 h-3 bg-white border-2 border-current rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* 다음 티어까지 남은 점수 */}
          {nextTier && (
            <p className="text-center text-sm text-gray-600 mt-2">
              다음 티어까지 <span className="font-semibold text-blue-600">{nextTier.min - score}점</span> 필요
            </p>
          )}
        </div>
      )}

      {/* Focus 레벨 설명 */}
      {size === 'lg' && (
        <div className="mt-4 text-center max-w-xs">
          <div className={`font-medium ${currentTier.textColor} mb-1`}>
            {currentTier.name} 레벨
          </div>
          <div className="text-xs text-gray-600">
            {currentTier.name === 'Blurry' && '이제 막 CoSnap을 시작했어요'}
            {currentTier.name === 'Focusing' && '꾸준히 활동하고 있어요'}
            {currentTier.name === 'Clear' && '신뢰할 수 있는 CoSnapper'}
            {currentTier.name === 'Crystal' && '최고의 CoSnap 전문가'}
          </div>
        </div>
      )}
    </div>
  );
}

// 작은 버전의 Focus 미터 (리스트용)
export function FocusBadge({ score }: { score: number }) {
  const currentTier = focusTiers.find(tier => score >= tier.min && score <= tier.max) || focusTiers[0];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentTier.textColor} bg-opacity-10 ${currentTier.color.replace('from-', 'bg-').split(' ')[0]}`}>
      <div className="w-2 h-2 rounded-full bg-current"></div>
      {currentTier.name} ({score})
    </div>
  );
}

// Focus 변화 표시 컴포넌트
export function FocusChange({ delta, reason }: { delta: number; reason: string }) {
  const isPositive = delta > 0;

  return (
    <div className={`flex items-center gap-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      <span className="font-medium">
        {isPositive ? '+' : ''}{delta}
      </span>
      <span>{reason}</span>
    </div>
  );
}