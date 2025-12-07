import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2, Mail, Calendar } from "lucide-react";
import { PHOTO_STYLE_ICONS_RECORD } from "~/lib/constants";
import { useLanguage } from "~/context/language-context";

interface FlagCardProps {
  id: string;
  title: string;
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
  type?: string;
  languages?: string[];
  serviceLevel?: string | null;
}

const statusVariants = {
  active: "default",
  hidden: "secondary",
  expired: "destructive",
} as const;

export default function FlagCard({
  id,
  title,
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
  type,
  languages,
  serviceLevel,
}: FlagCardProps) {
  const { t } = useLanguage();

  const statusLabels = {
    active: t ? t("flagCard.status.active") : "활성",
    hidden: t ? t("flagCard.status.hidden") : "숨김",
    expired: t ? t("flagCard.status.expired") : "만료",
  };

  const getTypeLabel = (type?: string) => {
    // Basic mapping, can be expanded
    switch (type) {
      case "meet": return { label: t("flagType.meet"), color: "bg-orange-100 text-orange-800 border-orange-200" };
      case "meetup": return { label: t("flagType.meet"), color: "bg-orange-100 text-orange-800 border-orange-200" }; // Legacy support
      case "help": return { label: t("flagType.help"), color: "bg-red-100 text-red-800 border-red-200" };
      case "emergency": return { label: t("flagType.emergency"), color: "bg-red-500 text-white border-red-600" };
      case "free": return { label: t("flagType.free"), color: "bg-green-100 text-green-800 border-green-200" };
      case "photo": return { label: t("flagType.photo"), color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "offer": return { label: t("flagType.offer"), color: "bg-blue-100 text-blue-800 border-blue-200" };
      default: return { label: type || t("flagType.other"), color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const typeInfo = getTypeLabel(type);

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{flag}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 {type && <Badge variant="outline" className={`text-xs font-semibold ${typeInfo.color}`}>{typeInfo.label}</Badge>}
                 {serviceLevel && <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">{serviceLevel}</Badge>}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {destination}, {country}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
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
        {/* Description / Note */}
        {note && (
          <div>
            <h4 className="sr-only">설명</h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {note}
            </p>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
            {languages.map(lang => (
              <Badge key={lang} variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200">
                {lang === 'ko' ? '🇰🇷 한국어' : lang === 'en' ? '🇺🇸 English' : lang}
              </Badge>
            ))}
          </div>
        )}

        {/* 사진 스타일 - Legacy or if provided */}
        {styles && styles.length > 0 && (
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
        )}

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
