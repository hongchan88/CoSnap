import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import Modal from './ui/Modal';
import LoadingSpinner from './ui/LoadingSpinner';
import Notification from './ui/Notification';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  flagData: {
    id: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    ownerName: string;
  };
  onSubmit?: (offerData: any) => void; // Optional now as we use fetcher
}

interface OfferFormData {
  message: string;
  preferredDates: string[];
  photoStyles: string[];
  location: string;
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
];

export default function OfferModal({ isOpen, onClose, flagData }: OfferModalProps) {
  const fetcher = useFetcher();
  const [formData, setFormData] = useState<OfferFormData>({
    message: '',
    preferredDates: [],
    photoStyles: [],
    location: '',
  });

  const [errors, setErrors] = useState<Partial<OfferFormData>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setNotification({ type: 'success', message: '오퍼가 성공적으로 전송되었습니다!' });
        setFormData({
          message: '',
          preferredDates: [],
          photoStyles: [],
          location: '',
        });
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else if (fetcher.data.error) {
        setNotification({ type: 'error', message: fetcher.data.error });
      }
    }
  }, [fetcher.state, fetcher.data, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OfferFormData> = {};

    if (!formData.message.trim()) {
      newErrors.message = '메시지를 입력해주세요';
    } else if (formData.message.length < 20) {
      newErrors.message = '메시지는 최소 20자 이상이어야 합니다';
    }

    if (formData.preferredDates.length === 0) {
      newErrors.preferredDates = ['희망 날짜를 최소 1개 이상 선택해주세요'];
    }

    if (formData.photoStyles.length === 0) {
      newErrors.photoStyles = ['선호 사진 스타일을 최소 1개 이상 선택해주세요'];
    }

    if (!formData.location.trim()) {
      newErrors.location = '희망 장소를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format the message to include all details
    const formattedMessage = `
${formData.message}

---
📍 희망 장소: ${formData.location}
📅 희망 날짜: ${formData.preferredDates.join(', ')}
📸 선호 스타일: ${formData.photoStyles.map(s => photoStyleOptions.find(opt => opt.value === s)?.label).join(', ')}
    `.trim();

    fetcher.submit(
      {
        intent: "create_offer",
        flagId: flagData.id,
        message: formattedMessage,
      },
      { method: "post", action: "/explore" }
    );
  };

  const handleDateChange = (date: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredDates: [...prev.preferredDates, date]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredDates: prev.preferredDates.filter(d => d !== date)
      }));
    }
  };

  const handlePhotoStyleChange = (style: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        photoStyles: [...prev.photoStyles, style]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        photoStyles: prev.photoStyles.filter(s => s !== style)
      }));
    }
  };

  // 날짜 옵션 생성 (실제로는 flagData의 날짜 범위에서 계산)
  const generateDateOptions = () => {
    const options = [];
    const startDate = new Date(flagData.startDate);
    const endDate = new Date(flagData.endDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
      options.push({ value: dateStr, label });
    }

    return options.slice(0, 10); // 최대 10개만 표시
  };

  const dateOptions = generateDateOptions();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="오퍼 보내기" size="lg">
        <div className="space-y-6">
          {/* Flag 정보 */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                📍 {flagData.destination}, {flagData.country}
              </h4>
              <p className="text-sm text-gray-600">
                {new Date(flagData.startDate).toLocaleDateString('ko-KR')} - {' '}
                {new Date(flagData.endDate).toLocaleDateString('ko-KR')}
              </p>
              <p className="text-sm text-gray-600">
                {flagData.ownerName} 님에게 오퍼 보내기
              </p>
            </CardContent>
          </Card>

          {/* 알림 */}
          {notification && (
            <div className="mb-4">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
                autoClose={false}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 메시지 */}
            <div className="space-y-2">
              <Label htmlFor="message">
                소개 메시지 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="안녕하세요! 같이 멋진 사진 찍어봐요. 어떤 사진을 선호하시나요?"
                className={errors.message ? 'border-red-500' : ''}
                rows={4}
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                {errors.message && (
                  <p className="text-sm text-red-600">{errors.message}</p>
                )}
                <p className="text-sm text-gray-500">{formData.message.length}/500자</p>
              </div>
            </div>

            {/* 희망 날짜 */}
            <div className="space-y-3">
              <Label>
                희망 날짜 <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto p-3 border rounded-lg">
                {dateOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`date-${option.value}`}
                      checked={formData.preferredDates.includes(option.value)}
                      onCheckedChange={(checked) => handleDateChange(option.value, checked as boolean)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`date-${option.value}`} className="text-sm font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.preferredDates && (
                <p className="text-sm text-red-600">{errors.preferredDates[0]}</p>
              )}
            </div>

            {/* 선호 사진 스타일 */}
            <div className="space-y-3">
              <Label>
                선호 사진 스타일 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {photoStyleOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`style-${option.value}`}
                      checked={formData.photoStyles.includes(option.value)}
                      onCheckedChange={(checked) => handlePhotoStyleChange(option.value, checked as boolean)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`style-${option.value}`} className="text-sm font-normal">
                      {option.icon} {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.photoStyles && (
                <p className="text-sm text-red-600">{errors.photoStyles[0]}</p>
              )}
            </div>

            {/* 희망 장소 */}
            <div className="space-y-2">
              <Label htmlFor="location">
                희망 장소 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="예: 강남역, 명동, 신주쿠 등"
                className={errors.location ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    전송 중...
                  </>
                ) : (
                  '오퍼 보내기'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}