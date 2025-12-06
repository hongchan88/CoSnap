import { useState, Suspense, lazy, useId } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import Notification from "./ui/Notification";
import { format } from "date-fns";
import { DatePicker } from "./ui/date-picker";
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
  title: string;
  note: string;
  languages: string[];
  latitude?: number | null;
  longitude?: number | null;
  type: string;
  // Meetup-specific
  meetupCategory?: string;
  // Offer Paid Help-specific
  serviceLevel?: string;
  serviceCategory?: string;
  serviceOther?: string;
}

interface FlagFormProps {
  onSubmit: (data: FlagFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FlagFormData> & { id?: string };
  isEditing?: boolean;
  isPremium?: boolean;
  onCardClick?: () => void;
}

export default function FlagForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isPremium = false,
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

  const typeOptions = [
    { value: "meet", label: "👋 Meetup", description: "Hang out with locals or travelers" },
    { value: "help", label: "🙏 Help Needed", description: "Ask for assistance" },
    { value: "emergency", label: "🚨 Emergency", description: "Urgent help needed" },
    
    { value: "free", label: "🎁 Free / Giveaway", description: "Giving away items" },
    { value: "photo", label: "📷 Photo Exchange", description: "Trade photos" },
    { value: "offer", label: "🤝 Offer Paid Help", description: "Language help, guide, professional service etc" },
  ];

  const meetupCategoryOptions = [
    { value: "sport", label: "⚽ Sport / Activity" },
    { value: "photo", label: "📸 Photo Exchange" },
    { value: "food_tour", label: "🍜 Food Tour" },
    { value: "sightseeing", label: "🏰 Sightseeing" },
    { value: "nightlife", label: "🌙 Nightlife" },
    { value: "other", label: "✨ Other" },
  ];

  const serviceLevelOptions = [
    { value: "amateur", label: "Amateur" },
    { value: "pro", label: "Professional" },
  ];

  const serviceCategoryOptions = [
    { value: "language", label: "🗣️ Language Help" },
    { value: "tour_guide", label: "🧭 Tour Guide" },
    { value: "other", label: "✍️ Other (specify below)" },
  ];

  const [formData, setFormData] = useState<FlagFormData>({
    city: "",
    country: "",
    title: "",
    startDate: "",
    endDate: "",
    note: "",
    languages: ["ko"], // 기본 언어는 한국어
    latitude: null,
    longitude: null,
    type: "meet",
    meetupCategory: undefined,
    serviceLevel: undefined,
    serviceCategory: undefined,
    serviceOther: undefined,
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
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const requestPrefix = useId();

  // Handle address updates from map
  const handleAddressSelect = (city: string, country: string) => {
    // If this is the first detection (auto-locate), set the detected country
    if (!detectedCountry) {
      setDetectedCountry(country);
    }
    
    setFormData((prev) => ({
      ...prev,
      city,
      country,
    }));
    
    // Clear errors if present
    if (errors.city || errors.country) {
      setErrors((prev) => ({ ...prev, city: undefined, country: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FlagFormData, string>> = {};

    if (!formData.city.trim()) {
      newErrors.city = t("flagForm.error.cityRequired") || "도시를 입력해주세요";
    }

    if (!formData.title.trim()) {
      newErrors.title = t("flagForm.error.titleRequired") || "제목을 입력해주세요";
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.latitude = "Please select a location on the map";
    }

    if (detectedCountry && formData.country && formData.country !== detectedCountry) {
      newErrors.country = `You can only create flags in your current country (${detectedCountry})`;
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
      
      // Type-specific duration limits
      const maxDays = formData.type === "offer" ? 7 : 3;
      if (diffDays > maxDays) {
        newErrors.endDate = formData.type === "offer" 
          ? "Offer duration cannot exceed 7 days"
          : t("flagForm.error.maxDuration") || "여행 기간은 3일을 초과할 수 없습니다";
      }
    }

    // Type-specific validation
    if (formData.type === "meet" && !formData.meetupCategory) {
      newErrors.meetupCategory = "Please select a meetup category";
    }

    if (formData.type === "offer") {
      if (!formData.serviceLevel) {
        newErrors.serviceLevel = "Please select a service level";
      }
      if (!formData.serviceCategory) {
        newErrors.serviceCategory = "Please select a service category";
      }
    }

    if (formData.languages.length === 0) {
      newErrors.languages = t("flagForm.error.languagesRequired") || "사용 가능 언어를 최소 1개 이상 선택해주세요";
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = t("flagForm.error.noteTooLong") || "설명은 500자를 초과할 수 없습니다";
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

  const handleDateChange = (field: "startDate" | "endDate", date?: Date) => {
    if (date) {
      handleInputChange(field, format(date, "yyyy-MM-dd"));
    } else {
      handleInputChange(field, "");
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
          {/* Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="type">
              {t("flagForm.type") || "Flag Type"} <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange("type", option.value)}
                  className={`
                    cursor-pointer p-3 border rounded-lg transition-all
                    ${formData.type === option.value 
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="font-medium text-sm text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional: Meetup Category */}
          {formData.type === "meet" && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="meetupCategory">
                What kind of meetup? <span className="text-red-500">*</span>
              </Label>
              <select
                id="meetupCategory"
                value={formData.meetupCategory || ""}
                onChange={(e) => handleInputChange("meetupCategory", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {meetupCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional: Offer Paid Help Fields */}
          {formData.type === "offer" && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              {/* Service Level */}
              <div className="space-y-2">
                <Label>Service Level <span className="text-red-500">*</span></Label>
                <div className="flex gap-4">
                  {serviceLevelOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleInputChange("serviceLevel", option.value)}
                      className={`
                        cursor-pointer px-4 py-2 border rounded-lg transition-all flex-1 text-center
                        ${formData.serviceLevel === option.value 
                          ? "border-purple-500 bg-purple-100 ring-1 ring-purple-500" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Category */}
              <div className="space-y-2">
                <Label>What service can you offer? <span className="text-red-500">*</span></Label>
                <div className="space-y-2">
                  {serviceCategoryOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleInputChange("serviceCategory", option.value)}
                      className={`
                        cursor-pointer p-3 border rounded-lg transition-all
                        ${formData.serviceCategory === option.value 
                          ? "border-purple-500 bg-purple-100 ring-1 ring-purple-500" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Other (if "other" is selected) */}
              {formData.serviceCategory === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="serviceOther">Describe your service</Label>
                  <Input
                    id="serviceOther"
                    value={formData.serviceOther || ""}
                    onChange={(e) => handleInputChange("serviceOther", e.target.value)}
                    placeholder="e.g., Photography, Translation, etc."
                  />
                </div>
              )}
            </div>
          )}



          {/* 지도 선택 (moved after city/country) */}
          <div className="space-y-2">
            <Label>{t("flagForm.location") || "Location"}</Label>
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
                onAddressSelect={handleAddressSelect}
                flyToRequest={flyToRequest}
                disabled={!isPremium}
              />
            </Suspense>
            {/* Privacy Note */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-400 text-lg">🔒</span>
              <p className="text-xs text-gray-600">
                {isPremium 
                  ? "Your exact location will not be shared. We will set a random point within a 10km radius for privacy."
                  : "Free users cannot set a marker outside of your current country. We will use your current location with a 10km radius for privacy. Upgrade to Premium to pick a custom location."}
              </p>
            </div>
            {/* Show location errors here since inputs are hidden */}
            {(errors.latitude || errors.country) && (
              <p className="text-sm text-red-600 mt-1">
                {errors.latitude || errors.country}
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t("flagForm.titleLabel") || "Title"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t("flagForm.titlePlaceholder") || "Enter a title for your plan"}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 여행 날짜 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                {t("flagForm.startDate")} <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={formData.startDate ? new Date(formData.startDate) : undefined}
                setDate={(date) => handleDateChange("startDate", date)}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                {t("flagForm.endDate")} <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={formData.endDate ? new Date(formData.endDate) : undefined}
                setDate={(date) => handleDateChange("endDate", date)}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 설명 (구 메모) */}
          <div className="space-y-2">
            <Label htmlFor="note">{t("flagForm.description") || "Description"}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder={t("flagForm.descriptionPlaceholder") || "Describe your plan..."}
              className={errors.note ? "border-red-500" : ""}
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-red-600">{errors.note}</p>
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