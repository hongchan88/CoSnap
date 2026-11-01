import { useLanguage } from "~/context/language-context";
import { profileText } from "~/lib/profile-copy";
import { useState, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import Notification from './ui/Notification';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader } from './ui/card';
import AvatarUpload from './AvatarUpload';

interface ProfileFormData {
  username: string;
  bio: string;
  cameraGear: string;
  photoStyles: string[];
  languages: string[];
  location: string;
  avatarFile?: File | null;
  avatarUrl?: string | null;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ProfileFormData> & { avatarUrl?: string | null };
}

const photoStyleOptions = [
  { value: 'portrait', label: '인물 사진', icon: '👤' },
  { value: 'landscape', label: '풍경 사진', icon: '🏞️' },
  { value: 'street', label: '거리 사진', icon: '🏙️' },
  { value: 'food', label: '음식 사진', icon: '🍽️' },
  { value: 'night', label: '야경 사진', icon: '🌃' },
  { value: 'architecture', label: '건축 사진', icon: '🏛️' },
  { value: 'candid', label: '자연스러운 순간', icon: '📸' },
  { value: 'cultural', label: '문화/축제', icon: '🎭' },
  { value: 'fashion', label: '패션', icon: '👔' },
  { value: 'sports', label: '스포츠', icon: '⚽' },
];

const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
];

export default function ProfileForm({ onSubmit, onCancel, initialData }: ProfileFormProps) {
  const { language } = useLanguage();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const p = (text: string) => profileText(language, text);
  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    username: initialData?.username || '',
    bio: initialData?.bio || '',
    cameraGear: initialData?.cameraGear || '',
    photoStyles: initialData?.photoStyles || [],
    languages: initialData?.languages || ['ko'],
    location: initialData?.location || '',
    avatarFile: null,
    avatarUrl: initialData?.avatarUrl || null,
  }));

  // Store initial values for change detection
  const [initialValues] = useState<ProfileFormData>(() => ({
    username: initialData?.username || '',
    bio: initialData?.bio || '',
    cameraGear: initialData?.cameraGear || '',
    photoStyles: initialData?.photoStyles || [],
    languages: initialData?.languages || ['ko'],
    location: initialData?.location || '',
    avatarFile: null,
    avatarUrl: initialData?.avatarUrl || null,
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { setErrors({}); setNotification(null); }, [language]);

  // Detect changes by comparing current form data with initial values
  useEffect(() => {
    const checkForChanges = () => {
      const hasTextChanged =
        formData.username !== initialValues.username ||
        formData.bio !== initialValues.bio ||
        formData.cameraGear !== initialValues.cameraGear ||
        formData.location !== initialValues.location ||
        formData.avatarUrl !== initialValues.avatarUrl;

      const hasArrayChanges =
        JSON.stringify([...formData.photoStyles].sort()) !== JSON.stringify([...initialValues.photoStyles].sort()) ||
        JSON.stringify([...formData.languages].sort()) !== JSON.stringify([...initialValues.languages].sort());

      const hasAvatarFile = formData.avatarFile !== null;

      setHasChanges(hasTextChanged || hasArrayChanges || hasAvatarFile);
    };

    checkForChanges();
  }, [formData, initialValues]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = p('사용자 이름을 입력해주세요');
    } else if (formData.username.length < 2) {
      newErrors.username = p('사용자 이름은 최소 2자 이상이어야 합니다');
    } else if (formData.username.length > 20) {
      newErrors.username = p('사용자 이름은 20자를 초과할 수 없습니다');
    } else if (!/^[a-zA-Z0-9가-힣_]+$/.test(formData.username)) {
      newErrors.username = p('사용자 이름은 영문, 숫자, 한글, 밑줄만 사용 가능합니다');
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = p('자기소개는 500자를 초과할 수 없습니다');
    }

    if (formData.cameraGear && formData.cameraGear.length > 200) {
      newErrors.cameraGear = p('카메라 장비 정보는 200자를 초과할 수 없습니다');
    }

    if (formData.photoStyles.length === 0) {
      newErrors.photoStyles = p('선호 사진 스타일을 최소 1개 이상 선택해주세요');
    }

    if (formData.languages.length === 0) {
      newErrors.languages = p('사용 가능 언어를 최소 1개 이상 선택해주세요');
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = p('위치 정보는 100자를 초과할 수 없습니다');
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
      setNotification({ type: 'success', message: p('프로필이 성공적으로 업데이트되었습니다!') });

      setTimeout(() => {
        onCancel();
        setNotification(null);
      }, 1500);

    } catch (error) {
      setNotification({
        type: 'error',
        message: p('프로필 업데이트에 실패했습니다. 다시 시도해주세요.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      photoStyles: prev.photoStyles.includes(style)
        ? prev.photoStyles.filter(s => s !== style)
        : [...prev.photoStyles, style]
    }));
    if (errors.photoStyles) {
      setErrors(prev => ({ ...prev, photoStyles: undefined }));
    }
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: undefined }));
    }
  };

  return (
    <div className="w-full">
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
          {/* 프로필 사진 */}
          <div className="space-y-2">
            <Label>{p("프로필 사진")}</Label>
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={formData.avatarUrl}
                onAvatarChange={(file) => handleInputChange('avatarFile', file)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 사용자 이름 */}
          <div className="space-y-2">
            <Label htmlFor="username">
              {p("사용자 이름")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder={p("2-20자, 영문/숫자/한글/밑줄")}
              className={errors.username ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* 위치 */}
          <div className="space-y-2">
            <Label htmlFor="location">
              {p("위치")}
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={p("예: 서울, 한국")}
              className={errors.location ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* 자기소개 */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              {p("자기소개")}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder={p("여행을 사랑하는 사진 작가입니다. 새로운 사람들을 만나고 멋진 순간들을 함께 담는 것을 좋아해요.")}
              className={`resize-none ${errors.bio ? 'border-red-500' : ''}`}
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio}</p>
              )}
              <p className="text-sm text-gray-500">{formData.bio.length}/500 {language === "ko" ? "자" : "characters"}</p>
            </div>
          </div>

          {/* 카메라 장비 */}
          <div className="space-y-2">
            <Label htmlFor="cameraGear">
              {p("카메라 장비")}
            </Label>
            <Input
              id="cameraGear"
              type="text"
              value={formData.cameraGear}
              onChange={(e) => handleInputChange('cameraGear', e.target.value)}
              placeholder={p("예: Canon EOS R6, iPhone 15 Pro")}
              className={errors.cameraGear ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.cameraGear && (
              <p className="text-sm text-red-600">{errors.cameraGear}</p>
            )}
          </div>

          {/* 사진 스타일 */}
          <div className="space-y-3">
            <Label>
              {p("선호 사진 스타일")} <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photoStyleOptions.map(option => (
                <label
                  key={option.value}
                  htmlFor={`photo-${option.value}`}
                  className={`
                    flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${formData.photoStyles.includes(option.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <Checkbox
                    id={`photo-${option.value}`}
                    checked={formData.photoStyles.includes(option.value)}
                    onCheckedChange={() => handlePhotoStyleToggle(option.value)}
                    disabled={isSubmitting}
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{p(option.label)}</span>
                </label>
              ))}
            </div>
            {errors.photoStyles && (
              <p className="text-sm text-red-600">{errors.photoStyles}</p>
            )}
          </div>

          {/* 언어 */}
          <div className="space-y-3">
            <Label>
              {p("사용 가능 언어")} <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map(option => (
                <label
                  key={option.value}
                  htmlFor={`lang-${option.value}`}
                  className={`
                    flex items-center space-x-2 px-4 py-2 border rounded-full cursor-pointer transition-colors
                    ${formData.languages.includes(option.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <Checkbox
                    id={`lang-${option.value}`}
                    checked={formData.languages.includes(option.value)}
                    onCheckedChange={() => handleLanguageToggle(option.value)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium">{language === "en" ? new Intl.DisplayNames([locale], { type: "language" }).of(option.value) : option.label}</span>
                </label>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-600">{errors.languages}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {hasChanges && (
              <div className="text-center">
                <span className="text-sm text-blue-600 font-medium">
                  {p("💾 저장되지 않은 변경사항이 있습니다")}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              {p("취소")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  {p("저장 중...")}
                </>
              ) : hasChanges ? (
                p('저장하기')
              ) : (
                p('변경된 내용이 없습니다')
              )}
            </Button>
            </div>
          </div>
        </form>
    </div>
  );
}