import { useState, Suspense, lazy, useId } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import Notification from "./ui/Notification";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader } from "./ui/card";
import { PHOTO_STYLE_OPTIONS_ARRAY } from "~/lib/constants";
import { useLanguage } from "~/context/language-context";

// Lazy load LocationPickerMap to avoid SSR issues with Leaflet
const LocationPickerMap = lazy(() => import("./LocationPickerMap"));

interface FlagFormData {
  id?: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  note: string;
  photoStyles: string[];
  languages: string[];
  latitude?: number | null;
  longitude?: number | null;
}

interface FlagFormProps {
  onSubmit: (data: FlagFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FlagFormData> & { id?: string };
  isEditing?: boolean;
  onCardClick?: () => void;
}

export default function FlagForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: FlagFormProps) {
  // Use a safe default for t function to avoid SSR issues
  const { t } = useLanguage();

  // Define options inside component to have access to t function
  const countryOptions = [
    { value: "JP", label: t("flagForm.country.japan") || "🇯🇵 일본" },
    { value: "KR", label: t("flagForm.country.korea") || "🇰🇷 한국" },
    { value: "US", label: t("flagForm.country.usa") || "🇺🇸 미국" },
    { value: "FR", label: t("flagForm.country.france") || "🇫🇷 프랑스" },
    { value: "IT", label: t("flagForm.country.italy") || "🇮🇹 이탈리아" },
    { value: "GB", label: t("flagForm.country.uk") || "🇬🇧 영국" },
    { value: "CN", label: t("flagForm.country.china") || "🇨🇳 중국" },
    { value: "TH", label: t("flagForm.country.thailand") || "🇹🇭 태국" },
    { value: "VN", label: t("flagForm.country.vietnam") || "🇻🇳 베트남" },
    { value: "TW", label: t("flagForm.country.taiwan") || "🇹🇼 대만" },
  ];

  const languageOptions = [
    { value: "ko", label: t("flagForm.language.korean") || "한국어" },
    { value: "en", label: t("flagForm.language.english") || "English" },
    { value: "ja", label: t("flagForm.language.japanese") || "日本語" },
    { value: "zh", label: t("flagForm.language.chinese") || "中文" },
    { value: "fr", label: t("flagForm.language.french") || "Français" },
    { value: "es", label: t("flagForm.language.spanish") || "Español" },
  ];

  const [formData, setFormData] = useState<FlagFormData>({
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    note: "",
    photoStyles: [],
    languages: ["ko"], // 기본 언어는 한국어
    latitude: null,
    longitude: null,
    ...initialData,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FlagFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [flyToRequest, setFlyToRequest] = useState<{
    city: string;
    country: string;
    requestId: number;
  } | null>(null);
  const requestPrefix = useId();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FlagFormData, string>> = {};

    if (!formData.city.trim()) {
      newErrors.city = t("flagForm.error.cityRequired") || "도시를 입력해주세요";
    }

    if (!formData.country) {
      newErrors.country = t("flagForm.error.countryRequired") || "국가를 선택해주세요";
    }

    if (!formData.startDate) {
      newErrors.startDate = t("flagForm.error.startDateRequired") || "시작일을 선택해주세요";
    }

    if (!formData.endDate) {
      newErrors.endDate = t("flagForm.error.endDateRequired") || "종료일을 선택해주세요";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start <= today) {
        newErrors.startDate = t("flagForm.error.startDateFuture") || "시작일은 오늘 이후여야 합니다";
      }

      if (end <= start) {
        newErrors.endDate = t("flagForm.error.endDateAfterStart") || "종료일은 시작일 이후여야 합니다";
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        newErrors.endDate = t("flagForm.error.maxDuration") || "여행 기간은 1년을 초과할 수 없습니다";
      }
    }

    if (formData.photoStyles.length === 0) {
      newErrors.photoStyles = t("flagForm.error.photoStylesRequired") || "선호 사진 스타일을 최소 1개 이상 선택해주세요";
    }

    if (formData.languages.length === 0) {
      newErrors.languages = t("flagForm.error.languagesRequired") || "사용 가능 언어를 최소 1개 이상 선택해주세요";
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = t("flagForm.error.noteTooLong") || "메모는 500자를 초과할 수 없습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof FlagFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoStyleToggle = (style: string, event?: React.MouseEvent) => {
    // Prevent event bubbling when called from checkbox click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setFormData((prev) => ({
      ...prev,
      photoStyles: prev.photoStyles.includes(style)
        ? prev.photoStyles.filter((s) => s !== style)
        : [...prev.photoStyles, style],
    }));
    if (errors.photoStyles) {
      setErrors((prev) => ({ ...prev, photoStyles: undefined }));
    }
  };

  const handleLanguageToggle = (lang: string, event?: React.MouseEvent) => {
    // Prevent event bubbling when called from checkbox click

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
    if (errors.languages) {
      setErrors((prev) => ({ ...prev, languages: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      await onSubmit(formData);
      setNotification({
        type: "success",
        message: isEditing
          ? t
            ? t("flagForm.success.updated")
            : "Flag가 수정되었습니다!"
          : t
          ? t("flagForm.success.created")
          : "Flag가 생성되었습니다!",
      });
    } catch (error) {
      console.error("Flag form submission error:", error);
      setNotification({
        type: "error",
        message: isEditing
          ? t
            ? t("flagForm.error.updateFailed") + t("flagForm.error.failedSuffix")
            : "수정에 실패했습니다. 다시 시도해주세요."
          : t
          ? t("flagForm.error.createFailed") + t("flagForm.error.failedSuffix")
          : "생성에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? t("flagForm.editTitle") : t("flagForm.title")}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 도시 */}
          <div className="space-y-2">
            <Label htmlFor="city">
              {t("flagForm.city")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder={t("flagForm.cityPlaceholder") || "예: 도쿄"}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          {/* 국가 */}
          <div className="space-y-2">
            <Label htmlFor="country">
              {t("flagForm.country")} <span className="text-red-500">*</span>
            </Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("flagForm.countryPlaceholder") || "국가를 선택해주세요"}</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          {/* 여행 날짜 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                {t("flagForm.startDate")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                {t("flagForm.endDate")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="note">{t("flagForm.note")}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder={t("flagForm.notePlaceholder")}
              className={errors.note ? "border-red-500" : ""}
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-red-600">{errors.note}</p>
            )}
          </div>

          {/* 선호 사진 스타일 */}
          <div className="space-y-2">
            <Label>
              {t("flagForm.photoStyle")} <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PHOTO_STYLE_OPTIONS_ARRAY.map((option) => (
                <div
                  key={option.value}
                  className={`
                    flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${
                      formData.photoStyles.includes(option.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                  `}
                >
                  <Checkbox
                    id={`photo-${option.value}`}
                    checked={formData.photoStyles.includes(option.value)}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      if (checked === undefined) return;
                      handlePhotoStyleToggle(option.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              ))}
            </div>
            {errors.photoStyles && (
              <p className="text-sm text-red-600">{errors.photoStyles}</p>
            )}
          </div>

          {/* 사용 가능 언어 */}
          <div className="space-y-2">
            <Label>
              {t("flagForm.languages")} <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    flex items-center space-x-2 px-4 py-2 border rounded-full cursor-pointer transition-colors
                    ${
                      formData.languages.includes(option.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                  `}
                >
                  <Checkbox
                    id={`lang-${option.value}`}
                    checked={formData.languages.includes(option.value)}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      if (checked !== undefined) {
                        handleLanguageToggle(option.value);
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-600">{errors.languages}</p>
            )}
          </div>

          {/* 지도 선택 */}
          <div className="space-y-2">
            <Label>{t("flagForm.location")}</Label>
            <Suspense
              fallback={
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <LoadingSpinner />
                </div>
              }
            >
              <LocationPickerMap
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                city={formData.city}
                country={formData.country}
                onLocationSelect={handleLocationSelect}
                flyToRequest={flyToRequest}
              />
            </Suspense>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("flagForm.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? <LoadingSpinner /> : isEditing ? t("flagForm.update") : t("flagForm.create")}
            </Button>
          </div>
        </form>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}