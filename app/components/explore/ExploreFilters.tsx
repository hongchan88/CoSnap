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
}

export default function ExploreFilters({
  selectedCity,
  selectedType,
  onCityChange,
  onTypeChange,
  onGoToMap,
  onCurrentLocation,
}: ExploreFiltersProps) {
  const { t } = useLanguage();

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

        {/* Type Filter */}
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="meet">👋 Meetup</SelectItem>
            <SelectItem value="help">🙏 Help Needed</SelectItem>
            <SelectItem value="emergency">🚨 Emergency</SelectItem>
            <SelectItem value="free">🎁 Free / Giveaway</SelectItem>
            <SelectItem value="photo">📷 Photo Exchange</SelectItem>
            <SelectItem value="offer">🤝 Offer Help</SelectItem>
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
