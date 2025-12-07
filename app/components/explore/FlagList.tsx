import { useEffect, useRef } from "react";
import { useLanguage } from "~/context/language-context";
import FlagListItem from "./FlagListItem";
import type { LatLngBounds } from "leaflet";

interface FlagListProps {
  flags: any[];
  mapBounds: LatLngBounds | null;
  expandedFlagId: string | null;
  currentUserId: string | null;
  onToggleExpand: (id: string) => void;
  onViewOnMap: (flag: any) => void;
  onProfileClick: (flag: any) => void;
  onSendOffer: (flag: any) => void;
  highlightedFlagId?: string | null;
}

export default function FlagList({
  flags,
  mapBounds,
  expandedFlagId,
  currentUserId,
  onToggleExpand,
  onViewOnMap,
  onProfileClick,
  onSendOffer,
  highlightedFlagId,
}: FlagListProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted flag
  useEffect(() => {
    if (highlightedFlagId && listRef.current) {
      const el = listRef.current.querySelector(`[data-flag-id="${highlightedFlagId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedFlagId]);

  return (
    <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {mapBounds ? t("explore.travelPlansInArea") : t("explore.loadingMap")}
        </h2>
        <span className="text-sm text-gray-500">
          {mapBounds ? `${flags.length} items` : ""}
        </span>
      </div>

      <div className="space-y-4">
        {!mapBounds && (
          <div className="text-center py-10 text-gray-500">
            {t("explore.loadingMap")}
          </div>
        )}

        {mapBounds && flags.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-2">🗺️</p>
            <p>{t("explore.noPlansInArea")}</p>
            <p className="text-sm">{t("explore.moveMapToFind")}</p>
          </div>
        )}

        {flags.map((flag) => (
          <div key={flag.id} data-flag-id={flag.id}>
            <FlagListItem
              flag={flag}
              isExpanded={expandedFlagId === flag.id}
              currentUserId={currentUserId}
              onToggleExpand={onToggleExpand}
              onViewOnMap={onViewOnMap}
              onProfileClick={onProfileClick}
              onSendOffer={onSendOffer}
              isHighlighted={highlightedFlagId === flag.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
