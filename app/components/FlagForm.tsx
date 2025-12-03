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

const countryOptions = [
  { value: "JP", label: "🇯🇵 일본" },
  { value: "KR", label: "🇰🇷 한국" },
  { value: "US", label: "🇺🇸 미국" },
  { value: "FR", label: "🇫🇷 프랑스" },
  { value: "IT", label: "🇮🇹 이탈리아" },
  { value: "GB", label: "🇬🇧 영국" },
  { value: "CN", label: "🇨🇳 중국" },
  { value: "TH", label: "🇹🇭 태국" },
  { value: "VN", label: "🇻🇳 베트남" },
  { value: "TW", label: "🇹🇼 대만" },
];


const languageOptions = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

export default function FlagForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: FlagFormProps) {
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
      newErrors.city = "도시를 입력해주세요";
    }

    if (!formData.country) {
      newErrors.country = "국가를 선택해주세요";
    }

    if (!formData.startDate) {
      newErrors.startDate = "시작일을 선택해주세요";
    }

    if (!formData.endDate) {
      newErrors.endDate = "종료일을 선택해주세요";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = "시작일은 오늘 이후여야 합니다";
      }

      if (end < start) {
        newErrors.endDate = "종료일은 시작일 이후여야 합니다";
      }

      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 365) {
        newErrors.endDate = "여행 기간은 1년을 초과할 수 없습니다";
      }
    }

    if (formData.photoStyles.length === 0) {
      newErrors.photoStyles = "선호 사진 스타일을 최소 1개 이상 선택해주세요";
    }

    if (formData.languages.length === 0) {
      newErrors.languages = "사용 가능 언어를 최소 1개 이상 선택해주세요";
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = "메모는 500자를 초과할 수 없습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setNotification({
        type: "success",
        message: isEditing
          ? "Flag가 수정되었습니다!"
          : "Flag가 생성되었습니다!",
      });

      setTimeout(() => {
        onCancel();
        setNotification(null);
      }, 1500);
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `${isEditing ? "수정" : "생성"}에 실패했습니다. 다시 시도해주세요.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FlagFormData, value: any) => {
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

  const getMinStartDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinEndDate = () => {
    return formData.startDate || getMinStartDate();
  };
  console.log(formData, "formdata");
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? "Flag 수정" : "새 Flag 만들기"}
        </h2>
      </CardHeader>
      <CardContent>
        {/* 알림 */}
        {notification && (
          <div className="mb-6">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
              autoClose={false}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 여행지 정보 */}
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor={`${requestPrefix}-country`}>
                국가 <span className="text-red-500">*</span>
              </Label>
              <select
                id={`${requestPrefix}-country`}
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.country ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              >
                <option value="">국가 선택</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-red-600 mt-1">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${requestPrefix}-city`}>
                도시 <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`${requestPrefix}-city`}
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="예: 도쿄, 파리, 뉴욕"
                className={errors.city ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>

            <div className="pb-0 md:pb-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isSubmitting || !formData.country}
                onClick={() => {
                  if (!formData.country) {
                    setErrors((prev) => ({
                      ...prev,
                      country: "국가를 먼저 선택해주세요",
                    }));
                    return;
                  }
                  // Clear existing coordinates so user picks a fresh point after fly-to
                  setFormData((prev) => ({
                    ...prev,
                    latitude: null,
                    longitude: null,
                  }));
                  setFlyToRequest({
                    city: formData.city,
                    country: formData.country,
                    requestId: Date.now(),
                  });
                }}
              >
                이 지역으로 이동
              </Button>
            </div>
          </div>

          {/* 지도 위치 선택 */}
          <div className="space-y-2">
            <Label>위치 상세 설정</Label>
            <Suspense
              fallback={
                <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400">
                  지도 로딩 중...
                </div>
              }
            >
              <LocationPickerMap
                city={formData.city}
                country={formData.country}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                flyToRequest={flyToRequest}
                onLocationSelect={(lat, lng) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                  }));
                }}
                onAddressSelect={(city, country) => {
                  setFormData((prev) => ({ ...prev, city, country }));
                }}
              />
            </Suspense>
            <p className="text-xs text-gray-500">
              지도에서 정확한 위치를 클릭하거나 드래그하여 설정하세요.
            </p>
          </div>

          {/* 여행 날짜 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                시작일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  handleInputChange("startDate", e.target.value);
                  // 시작일이 종료일보다 늦으면 종료일도 조정
                  if (formData.endDate && e.target.value > formData.endDate) {
                    handleInputChange("endDate", e.target.value);
                  }
                }}
                min={getMinStartDate()}
                className={errors.startDate ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                종료일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={getMinEndDate()}
                className={errors.endDate ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 사진 스타일 */}
          <div className="space-y-3">
            <Label>
              선호 사진 스타일 <span className="text-red-500">*</span>
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

          {/* 언어 */}
          <div className="space-y-3">
            <Label>
              사용 가능 언어 <span className="text-red-500">*</span>
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

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="note">메모 (선택사항)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="특별한 요청사항이나 희망사항을 자유롭게 작성해주세요..."
              className={errors.note ? "border-red-500" : ""}
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              {errors.note && (
                <p className="text-sm text-red-600">{errors.note}</p>
              )}
              <p className="text-sm text-gray-500">
                {formData.note.length}/500자
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  {isEditing ? "수정 중..." : "생성 중..."}
                </>
              ) : isEditing ? (
                "수정하기"
              ) : (
                "Flag 만들기"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
