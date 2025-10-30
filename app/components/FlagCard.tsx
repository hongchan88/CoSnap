import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2, Mail, Calendar } from "lucide-react";

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

const statusVariants = {
  active: 'default',
  hidden: 'secondary',
  expired: 'destructive',
} as const;

const statusLabels = {
  active: '활성',
  hidden: '숨김',
  expired: '만료',
};

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
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{flag}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {destination}, {country}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(startDate).toLocaleDateString('ko-KR')} - {new Date(endDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={statusVariants[status]} className="font-medium">
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 메모 */}
        {note && (
          <div>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
              {note}
            </p>
          </div>
        )}

        {/* 사진 스타일 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">선호 사진 스타일</h4>
          <div className="flex flex-wrap gap-2">
            {styles.map((style, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* 오퍼 정보 */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">받은 오퍼</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {offerCount}개
            </Badge>
          </div>
          {offerCount > 0 && (
            <Button
              variant="link"
              onClick={onViewOffers}
              className="p-0 h-auto text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              오퍼 보기 →
            </Button>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정하기
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제하기
              </Button>
            </>
          )}
          {!canEdit && status === 'active' && (
            <Button
              onClick={onViewOffers}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              오퍼 보기 ({offerCount})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}