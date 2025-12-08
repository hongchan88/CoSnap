import { Button } from "~/components/ui/button";
import { PHOTO_STYLE_ICONS_RECORD } from "~/lib/constants";
import { useLanguage } from "~/context/language-context";

interface FlagListItemProps {
  flag: any;
  isExpanded: boolean;
  currentUserId: string | null;
  onToggleExpand: (id: string) => void;
  onViewOnMap: (flag: any) => void;
  onProfileClick: (flag: any) => void;
  onSendOffer: (flag: any) => void;
  isHighlighted?: boolean;
}

export default function FlagListItem({
  flag,
  isExpanded,
  currentUserId,
  onToggleExpand,
  onViewOnMap,
  onProfileClick,
  onSendOffer,
  isHighlighted,
}: FlagListItemProps) {
  const { t } = useLanguage();

  const getTypeLabel = (type?: string) => {
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

  return (
    <div
      className={`bg-white rounded-xl border ${
        isExpanded || isHighlighted ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-gray-200'
      } p-4 hover:shadow-md transition-all cursor-pointer ${isHighlighted ? 'bg-blue-50/30' : ''}`}
      onClick={() => {
        onToggleExpand(flag.id);
        onViewOnMap(flag);
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          {flag.type && (
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border mb-1 ${getTypeLabel(flag.type).color}`}>
              {getTypeLabel(flag.type).label}
            </span>
          )}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
            {flag.title || `${flag.city} 여행`}
          </h3>
          <div className="text-sm text-gray-600 font-medium">
            {flag.city}, {flag.country}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(flag.start_date).toLocaleDateString()} -{" "}
            {new Date(flag.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {flag.profiles && (
            <button
              className="text-right hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick(flag);
              }}
            >
              <div className="flex items-center gap-2">
                {flag.profiles.avatar_url ? (
                  <img
                    src={flag.profiles.avatar_url}
                    alt={flag.profiles.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                    {flag.profiles.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(flag.id);
            }}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {flag.note && (
        <div className={`mt-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {flag.note}
          </p>
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">

          {/* Photo Styles */}
          {flag.styles && flag.styles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("explore.photoStyles")}</h4>
              <div className="flex flex-wrap gap-2">
                {flag.styles.map((style: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{PHOTO_STYLE_ICONS_RECORD[style] || '📷'}</span>
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Flag Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("explore.travelDetails")}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">{t("explore.startDate")}</span> {new Date(flag.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                <span className="font-medium">{t("explore.endDate")}</span> {new Date(flag.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                <span className="font-medium">{t("explore.duration")}</span> {Math.ceil((new Date(flag.end_date).getTime() - new Date(flag.start_date).getTime()) / (1000 * 60 * 60 * 24))} {t("explore.days")}
              </div>
              <div>
                <span className="font-medium">{t("explore.planType")}</span> {flag.source_policy_type === 'premium' ? t("flagCard.premium") : t("explore.free")}
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="flex gap-2 flex-wrap">
          {!isExpanded && flag.styles &&
            flag.styles
              .slice(0, 2)
              .map((style: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                >
                  <span>{PHOTO_STYLE_ICONS_RECORD[style] || '📷'}</span>
                  {style}
                </span>
              ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {/* 지도에서 가까이 보기 버튼 */}
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              onViewOnMap(flag);
              if (!isExpanded) {
                onToggleExpand(flag.id);
              }
            }}
          >
            {t("explore.viewOnMap")}
          </Button>

          {currentUserId === flag.user_id ? (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
              <span className="text-xs font-medium text-yellow-700">
                {t("explore.receivedOffers")} {(flag as any).offer_count || 0}{t("explore.count")}
              </span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onSendOffer(flag);
              }}
            >
              {t("explore.sendOffer")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
