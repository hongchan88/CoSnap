import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Calendar, MapPin, Clock, MessageCircle, User, Star, Camera } from 'lucide-react';

interface MatchCardProps {
  id: string;
  matchName: string;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'no_show';
  dateTime: string;
  location: string;
  destination: string;
  travelDates: {
    start: string;
    end: string;
  };
  photoStyles: string[];
  focusReward: number;
  estimatedTime?: string;
  onMessage?: () => void;
  onConfirmTime?: () => void;
  onViewLocation?: () => void;
  onCancel?: () => void;
  className?: string;
  isCompact?: boolean;
}

const statusVariants = {
  scheduled: {
    color: 'green',
    label: '예정됨',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-l-green-500',
    icon: Calendar
  },
  pending: {
    color: 'yellow',
    label: '확인 대기',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-l-yellow-500',
    icon: Clock
  },
  completed: {
    color: 'blue',
    label: '완료됨',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-l-blue-500',
    icon: Star
  },
  cancelled: {
    color: 'red',
    label: '취소됨',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-l-red-500',
    icon: Clock
  },
  no_show: {
    color: 'gray',
    label: '노쇼',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-l-gray-500',
    icon: User
  }
};

export default function MatchCard({
  id,
  matchName,
  status,
  dateTime,
  location,
  destination,
  travelDates,
  photoStyles,
  focusReward,
  estimatedTime,
  onMessage,
  onConfirmTime,
  onViewLocation,
  onCancel,
  className = '',
  isCompact = false
}: MatchCardProps) {
  const statusConfig = statusVariants[status];
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      <Card className={`h-full ${statusConfig.borderColor} hover:shadow-lg transition-all duration-200`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{matchName}</h3>
                <p className="text-sm text-gray-500">
                  {status === 'scheduled' && dateTime}
                  {status === 'pending' && '시간 확정 중'}
                  {status === 'completed' && '완료됨'}
                  {status === 'cancelled' && '취소됨'}
                  {status === 'no_show' && '노쇼 처리됨'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={`${statusConfig.textColor} ${statusConfig.bgColor}`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location and Destination */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{location}</p>
              <p className="text-sm text-gray-600">{destination}</p>
            </div>
          </div>

          {/* Travel Details */}
          <div className={`${statusConfig.bgColor} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{destination}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {new Date(travelDates.start).toLocaleDateString('ko-KR')} - {' '}
                {new Date(travelDates.end).toLocaleDateString('ko-KR')}
              </span>
            </div>

            {!isCompact && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">사진 스타일:</span>
                  <div className="flex flex-wrap gap-1">
                    {photoStyles.map((style, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
                {estimatedTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">예상 시간:</span>
                    <span>{estimatedTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Focus 보상:</span>
                  <span className="font-medium text-green-600">+{focusReward}점</span>
                </div>
              </div>
            )}
          </div>

          {/* Pending Status Message */}
          {status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⏰ 시간 조율이 필요합니다. 서로 가능한 시간을 제안해주세요.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {status === 'scheduled' && (
              <>
                <Button
                  onClick={onMessage}
                  className="flex-1"
                  size={isCompact ? 'sm' : 'default'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  메시지 보내기
                </Button>
                <Button
                  variant="outline"
                  onClick={onViewLocation}
                  size={isCompact ? 'sm' : 'default'}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  위치 확인
                </Button>
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  size={isCompact ? 'sm' : 'default'}
                  className="text-red-600 hover:text-red-800"
                >
                  매치 취소
                </Button>
              </>
            )}

            {status === 'pending' && (
              <>
                <Button
                  onClick={onConfirmTime}
                  className="flex-1"
                  size={isCompact ? 'sm' : 'default'}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  시간 제안하기
                </Button>
                <Button
                  variant="outline"
                  onClick={onMessage}
                  size={isCompact ? 'sm' : 'default'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  메시지 보내기
                </Button>
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  size={isCompact ? 'sm' : 'default'}
                  className="text-red-600 hover:text-red-800"
                >
                  매치 취소
                </Button>
              </>
            )}

            {status === 'completed' && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-600 mb-2">✨ CoSnap 완료</p>
                <Button
                  variant="outline"
                  onClick={onMessage}
                  size={isCompact ? 'sm' : 'default'}
                >
                  다시 만나기
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}