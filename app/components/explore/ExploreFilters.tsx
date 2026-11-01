import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useLanguage } from "~/context/language-context";
import { POPULAR_DESTINATIONS } from "~/lib/constants";

interface ExploreFiltersProps {
  selectedCity: string | null;
  selectedType: string;
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onGoToMap: () => void;
  onCurrentLocation: () => void;
  startDate: string;
  endDate: string;
  onDateChange: (key: "startDate" | "endDate", value: string) => void;
}

export default function ExploreFilters({
  selectedCity,
  selectedType,
  onCityChange,
  onTypeChange,
  onGoToMap,
  onCurrentLocation,
  startDate,
  endDate,
  onDateChange,
}: ExploreFiltersProps) {
  const { t, language } = useLanguage();

  return (
    <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {t("explore.title")}
      </h1>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Select
            value={selectedCity || ""}
            onValueChange={onCityChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("explore.selectDestination")} />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_DESTINATIONS.map((dest) => (
                <SelectItem key={dest.city} value={dest.city}>
                  {dest.country} - {dest.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onGoToMap}
            disabled={!selectedCity}
          >
            {t("explore.goToMap")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-medium" htmlFor="explore-start-date">{t("explore.startDate")}
            <input id="explore-start-date" type="date" value={startDate} onChange={event => onDateChange("startDate", event.target.value)} className="mt-1 block w-full rounded-md border px-2 py-2" />
          </label>
          <label className="text-sm font-medium" htmlFor="explore-end-date">{t("explore.endDate")}
            <input id="explore-end-date" type="date" min={startDate || undefined} value={endDate} onChange={event => onDateChange("endDate", event.target.value)} className="mt-1 block w-full rounded-md border px-2 py-2" />
          </label>
        </div>
        {/* Type Filter */}
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={language === "ko" ? "유형 선택" : "Filter by type"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "ko" ? "전체 유형" : "All types"}</SelectItem>
            <SelectItem value="meet">👋 {t("flagType.meet")}</SelectItem>
            <SelectItem value="help">🙏 {t("flagType.help")}</SelectItem>
            <SelectItem value="emergency">🚨 {t("flagType.emergency")}</SelectItem>
            <SelectItem value="free">🎁 {t("flagType.free")}</SelectItem>
            <SelectItem value="photo">📷 {t("flagType.photo")}</SelectItem>
            <SelectItem value="offer">🤝 {t("flagType.offer")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="w-full"
          onClick={onCurrentLocation}
        >
          {t("explore.currentLocation")}
        </Button>
      </div>
    </div>
  );
}
