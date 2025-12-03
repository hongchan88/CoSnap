export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "seoul": { lat: 37.5665, lng: 126.9780 },
  "서울": { lat: 37.5665, lng: 126.9780 },
  "tokyo": { lat: 35.6762, lng: 139.6503 },
  "도쿄": { lat: 35.6762, lng: 139.6503 },
  "osaka": { lat: 34.6937, lng: 135.5023 },
  "오사카": { lat: 34.6937, lng: 135.5023 },
  "paris": { lat: 48.8566, lng: 2.3522 },
  "파리": { lat: 48.8566, lng: 2.3522 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "런던": { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.0060 },
  "뉴욕": { lat: 40.7128, lng: -74.0060 },
  "bangkok": { lat: 13.7563, lng: 100.5018 },
  "방콕": { lat: 13.7563, lng: 100.5018 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
  "싱가포르": { lat: 1.3521, lng: 103.8198 },
  "hong kong": { lat: 22.3193, lng: 114.1694 },
  "홍콩": { lat: 22.3193, lng: 114.1694 },
  "taipei": { lat: 25.0330, lng: 121.5654 },
  "타이베이": { lat: 25.0330, lng: 121.5654 },
  "da nang": { lat: 16.0544, lng: 108.2022 },
  "다낭": { lat: 16.0544, lng: 108.2022 },
  "fukuoka": { lat: 33.5902, lng: 130.4017 },
  "후쿠오카": { lat: 33.5902, lng: 130.4017 },
  "sapporo": { lat: 43.0618, lng: 141.3545 },
  "삿포로": { lat: 43.0618, lng: 141.3545 },
  "sydney": { lat: -33.8688, lng: 151.2093 },
  "시드니": { lat: -33.8688, lng: 151.2093 },
  "melbourne": { lat: -37.8136, lng: 144.9631 },
  "멜버른": { lat: -37.8136, lng: 144.9631 },
  "barcelona": { lat: 41.3851, lng: 2.1734 },
  "바르셀로나": { lat: 41.3851, lng: 2.1734 },
  "rome": { lat: 41.9028, lng: 12.4964 },
  "로마": { lat: 41.9028, lng: 12.4964 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "로스앤젤레스": { lat: 34.0522, lng: -118.2437 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  "샌프란시스코": { lat: 37.7749, lng: -122.4194 },
};

export const POPULAR_DESTINATIONS = [
  { city: "Seoul", country: "South Korea", country_code: "KR", lat: 37.5665, lng: 126.9780, imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=500&h=300&fit=crop", count: 120 },
  { city: "Tokyo", country: "Japan", country_code: "JP", lat: 35.6762, lng: 139.6503, imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&h=300&fit=crop", count: 85 },
  { city: "Paris", country: "France", country_code: "FR", lat: 48.8566, lng: 2.3522, imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=300&fit=crop", count: 94 },
  { city: "London", country: "United Kingdom", country_code: "UK", lat: 51.5074, lng: -0.1278, imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&h=300&fit=crop", count: 76 },
  { city: "New York", country: "USA", country_code: "US", lat: 40.7128, lng: -74.0060, imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=300&fit=crop", count: 112 },
  { city: "Bangkok", country: "Thailand", country_code: "TH", lat: 13.7563, lng: 100.5018, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&h=300&fit=crop", count: 64 },
  { city: "Singapore", country: "Singapore", country_code: "SG", lat: 1.3521, lng: 103.8198, imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=300&fit=crop", count: 58 },
  { city: "Sydney", country: "Australia", country_code: "AU", lat: -33.8688, lng: 151.2093, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500&h=300&fit=crop", count: 45 },
];

// Photo style constants - unified structure for maximum reusability
export const PHOTO_STYLES = {
  portrait: {
    value: "portrait",
    label: "인물 사진",
    icon: "👤",
    description: "사람을 중심으로 한 사진",
  },
  landscape: {
    value: "landscape",
    label: "풍경 사진",
    icon: "🏞️",
    description: "자연 경치를 담은 사진",
  },
  street: {
    value: "street",
    label: "거리 사진",
    icon: "🏙️",
    description: "도시의 일상적인 풍경 사진",
  },
  food: {
    value: "food",
    label: "음식 사진",
    icon: "🍽️",
    description: "음식과 다이닝 사진",
  },
  night: {
    value: "night",
    label: "야경 사진",
    icon: "🌃",
    description: "밤의 도시 풍경 사진",
  },
  architecture: {
    value: "architecture",
    label: "건축 사진",
    icon: "🏛️",
    description: "건물과 구조물 사진",
  },
  candid: {
    value: "candid",
    label: "자연스러운 순간",
    icon: "📸",
    description: "포즈 없는 자연스러운 사진",
  },
  cultural: {
    value: "cultural",
    label: "문화/축제",
    icon: "🎭",
    description: "문화 행사나 축제 사진",
  },
} as const;

// Helper functions for backward compatibility and easy usage
export const getPhotoStyleIcon = (style: string): string => {
  return PHOTO_STYLES[style as keyof typeof PHOTO_STYLES]?.icon || '📷';
};

export const getPhotoStyleLabel = (style: string): string => {
  return PHOTO_STYLES[style as keyof typeof PHOTO_STYLES]?.label || style;
};

export const PHOTO_STYLE_OPTIONS_ARRAY = Object.values(PHOTO_STYLES);

export const getPhotoStyleOptions = () => {
  return PHOTO_STYLE_OPTIONS_ARRAY;
};

export const PHOTO_STYLE_ICONS_RECORD = Object.fromEntries(
  Object.values(PHOTO_STYLES).map(style => [style.value, style.icon])
);

export const getPhotoStyleIcons = (): Record<string, string> => {
  return PHOTO_STYLE_ICONS_RECORD;
};
