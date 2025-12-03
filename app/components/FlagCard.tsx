import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2, Mail, Calendar } from "lucide-react";
import { PHOTO_STYLE_ICONS_RECORD } from "~/lib/constants";
import { useLanguage } from "~/context/language-context";

interface FlagCardProps {
  id: string;
  destination: string;
  country: string;
  flag: string;
  startDate: string;
  endDate: string;
  status: "active" | "hidden" | "expired";
  offerCount: number;
  styles: string[];
  note?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  offers?: any[];
  isSentOfferFlag?: boolean;
}

const statusVariants = {
  active: "default",
  hidden: "secondary",
  expired: "destructive",
} as const;

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
  offers = [],
  isSentOfferFlag = false,
}: FlagCardProps) {
  const { t } = useLanguage();

  const statusLabels = {
    active: t ? t("flagCard.status.active") : "활성",
    hidden: t ? t("flagCard.status.hidden") : "숨김",
    expired: t ? t("flagCard.status.expired") : "만료",
  };

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
                  {new Date(startDate).toLocaleDateString("ko-KR")} -{" "}
                  {new Date(endDate).toLocaleDateString("ko-KR")}
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
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t ? t("flagCard.photoStyle") : "선호 사진 스타일"}
          </h4>
          <div className="flex flex-wrap gap-2">
            {styles.map((style, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <span>{PHOTO_STYLE_ICONS_RECORD[style] || "📷"}</span>
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* 오퍼 정보 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {isSentOfferFlag
                  ? t
                    ? t("flagCard.sentOffers")
                    : "보낸 오퍼"
                  : t
                    ? t("flagCard.receivedOffers")
                    : "받은 오퍼"}
              </span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {offerCount}
              {t ? t("flagCard.count") : "개"}
            </Badge>
          </div>

          {/* Offers List */}
          {offers.length > 0 && (
            <div className="space-y-2 mt-3 bg-gray-50 p-3 rounded-lg">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white p-3 rounded border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {offer.sender?.username || "Unknown User"}
                    </span>
                    <Badge
                      variant={
                        offer.status === "accepted"
                          ? "default"
                          : offer.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {offer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {offer.message}
                  </p>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(offer.sent_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t ? t("flagCard.edit") : "수정하기"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t ? t("flagCard.delete") : "삭제하기"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
