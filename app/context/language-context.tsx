import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Language = "en" | "ko";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation (already exists above in English section)
    "lang.korean": "한국어",
    "lang.english": "English",

    // Home page
    "home.title": "CoSnap - Photo Exchange Community for Travelers",
    "home.description":
      "CoSnap where travelers take photos of each other! Meet new people and capture unforgettable moments together.",
    "home.howItWorks.title": "How CoSnap Works",
    "home.howItWorks.subtitle":
      "Start your new travel experience in 4 simple steps",
    "home.howItWorks.step1.title": "Create Flag",
    "home.howItWorks.step1.desc":
      "Register your travel plan as a Flag and let other travelers know",
    "home.howItWorks.step2.title": "Exchange Offers",
    "home.howItWorks.step2.desc":
      "Send or receive offers to travelers you're interested in",
    "home.howItWorks.step3.title": "Get Matched",
    "home.howItWorks.step3.desc":
      "When an offer is accepted, the match is confirmed and you arrange to meet",
    "home.howItWorks.step4.title": "Earn Focus",
    "home.howItWorks.step4.desc":
      "After a successful CoSnap, leave reviews for each other and build Focus",

    "home.whyCoSnap.title": "Why CoSnap?",
    "home.whyCoSnap.subtitle":
      "Experience safe and enjoyable travel in a trust-based community",
    "home.whyCoSnap.focus.title": "Focus System",
    "home.whyCoSnap.focus.desc":
      "Build a safe community with trust scores. The more successful CoSnaps, the higher your Focus.",
    "home.whyCoSnap.planning.title": "Plan-based Matching",
    "home.whyCoSnap.planning.desc":
      "Share travel plans in advance and choose partners carefully. Safer and more meaningful interactions than real-time matching.",
    "home.whyCoSnap.premium.title": "Premium Benefits",
    "home.whyCoSnap.premium.desc":
      "Enjoy more opportunities and convenience with Premium. Create and modify travel plans anytime.",

    "home.activeFlags.title": "Currently Active Travel Plans",
    "home.activeFlags.subtitle":
      "Check real travel plans from other travelers and apply for CoSnaps",
    "home.activeFlags.noFlags": "No active travel plans yet",
    "home.activeFlags.createFirst": "Create First Travel Plan",
    "home.activeFlags.viewDetails": "View Details →",
    "home.activeFlags.premium": "Premium",
    "home.activeFlags.regular": "Regular",

    "home.topProfiles.title": "Top CoSnap Users",
    "home.topProfiles.subtitle": "Trusted users with high Focus scores",
    "home.topProfiles.equipment": "Equipment:",
    "home.topProfiles.style": "Style:",
    "home.topProfiles.languages": "Languages:",

    "home.testimonials.title": "CoSnap User Reviews",
    "home.testimonials.subtitle": "Real experiences from actual users",

    "home.cta.title": "Add CoSnap to Your Next Trip",
    "home.cta.subtitle":
      "Meet new people and capture unforgettable moments together. Create your travel plan now!",
    "home.cta.getStarted": "Get Started for Free",

    // Flag Card
    "flagCard.status.active": "Active",
    "flagCard.status.hidden": "Hidden",
    "flagCard.status.expired": "Expired",
    "flagCard.photoStyle": "Preferred Photo Styles",
    "flagCard.sentOffers": "Sent Offers",
    "flagCard.receivedOffers": "Received Offers",
    "flagCard.count": " offers",
    "flagCard.edit": "Edit",
    "flagCard.delete": "Delete",

    // Offer Modal
    "offerModal.title": "Send Offer",
    "offerModal.messageLabel": "Introduction Message",
    "offerModal.datesLabel": "Preferred Dates",
    "offerModal.photoStylesLabel": "Preferred Photo Styles",
    "offerModal.locationLabel": "Preferred Location",
    "offerModal.success": "Offer sent successfully!",
    "offerModal.error.minMessage": "Message must be at least 20 characters",
    "offerModal.error.messageRequired": "Please enter a message",
    "offerModal.error.datesRequired": "Please select at least 1 preferred date",
    "offerModal.error.photoStylesRequired": "Please select at least 1 preferred photo style",
    "offerModal.error.locationRequired": "Please enter a preferred location",
    "offerModal.sending": "Sending...",
    "offerModal.send": "Send Offer",
    "offerModal.cancel": "Cancel",
    "offerModal.photoStyle.portrait": "Portrait photos",
    "offerModal.photoStyle.landscape": "Landscape photos",
    "offerModal.photoStyle.street": "Street photos",
    "offerModal.photoStyle.food": "Food photos",
    "offerModal.photoStyle.night": "Night photos",
    "offerModal.photoStyle.architecture": "Architecture photos",
    "offerModal.photoStyle.candid": "Candid moments",
    "offerModal.photoStyle.cultural": "Cultural/festival photos",

    // Focus Meter
    "focusMeter.tier.blurry": "Blurry",
    "focusMeter.tier.focusing": "Focusing",
    "focusMeter.tier.clear": "Clear",
    "focusMeter.tier.crystal": "Crystal",
    "focusMeter.nextTierPoints": "Points needed to reach next tier: ",
    "focusMeter.points": " points",
    "characters": "characters",

    // Navigation
    "nav.home": "Home",
    "nav.explore": "Find Travelers",
    "nav.flags": "Create Flags",
    "nav.matches": "Matches",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.signup": "Sign Up",

    // Flags Page
    "flags.title": "My Travel Plans",
    "flags.description": "Create and manage your travel plans (Flags)",
    "flags.notification.created": "Flag has been created!",
    "flags.notification.updated": "Flag has been updated!",
    "flags.notification.deleted": "Flag has been deleted!",
    "flags.createButton": "Create New Travel Plan",
    "flags.processing": "Processing...",
    "flags.activeSection": "Upcoming Travels",
    "flags.pastSection": "Past Travels",
    "flags.emptyActive": "No upcoming travel plans",
    "flags.emptyActiveSub": "Create a new Flag to share your travel plan",
    "flags.emptyPast": "No past travel records",
    "flags.emptyPastSub": "Start your first CoSnap!",
    "flags.deleteConfirm": "Are you sure you want to delete this Flag?",
    "flags.premium.title": "Upgrade to Premium",
    "flags.premium.desc": "Create and modify travel plans anytime",
    "flags.premium.learnMore": "Learn More",

    // Flag Form
    "flagForm.title": "Flag 만들기",
    "flagForm.editTitle": "Flag 수정하기",
    "flagForm.city": "City",
    "flagForm.country": "Country",
    "flagForm.startDate": "Start Date",
    "flagForm.endDate": "End Date",
    "flagForm.note": "Note (Optional)",
    "flagForm.notePlaceholder": "Feel free to write any special requests or preferences...",
    "flagForm.photoStyle": "Preferred Photo Styles",
    "flagForm.languages": "Available Languages",
    "flagForm.location": "Location Selection (Optional)",
    "flagForm.cancel": "Cancel",
    "flagForm.create": "Create",
    "flagForm.update": "Update",
    "flagForm.country.japan": "🇯🇵 Japan",
    "flagForm.country.korea": "🇰🇷 Korea",
    "flagForm.country.usa": "🇺🇸 USA",
    "flagForm.country.france": "🇫🇷 France",
    "flagForm.country.italy": "🇮🇹 Italy",
    "flagForm.country.uk": "🇬🇧 UK",
    "flagForm.country.china": "🇨🇳 China",
    "flagForm.country.thailand": "🇹🇭 Thailand",
    "flagForm.country.vietnam": "🇻🇳 Vietnam",
    "flagForm.country.taiwan": "🇹🇼 Taiwan",
    "flagForm.language.korean": "한국어",
    "flagForm.language.english": "English",
    "flagForm.language.japanese": "日本語",
    "flagForm.language.chinese": "中文",
    "flagForm.language.french": "Français",
    "flagForm.language.spanish": "Español",
    "flagForm.error.cityRequired": "Please enter a city",
    "flagForm.error.countryRequired": "Please select a country",
    "flagForm.error.startDateRequired": "Please select a start date",
    "flagForm.error.endDateRequired": "Please select an end date",
    "flagForm.error.startDateFuture": "Start date must be after today",
    "flagForm.error.endDateAfterStart": "End date must be after start date",
    "flagForm.error.maxDuration": "Travel duration cannot exceed 1 year",
    "flagForm.error.photoStylesRequired": "Please select at least 1 preferred photo style",
    "flagForm.error.languagesRequired": "Please select at least 1 available language",
    "flagForm.error.noteTooLong": "Note cannot exceed 500 characters",
    "flagForm.success.updated": "Flag has been updated!",
    "flagForm.success.created": "Flag has been created!",
    "flagForm.error.updateFailed": "Failed to update",
    "flagForm.error.createFailed": "Failed to create",
    "flagForm.error.failedSuffix": ". Please try again.",

    // Explore Page
    "explore.title": "Explore Flags",
    "explore.selectDestination": "Select destination...",
    "explore.goToMap": "Go to map",
    "explore.currentLocation": "📍 Current Location",
    "explore.travelPlansInArea": "Travel plans in this area",
    "explore.count": " items",
    "explore.loadingMap": "Loading map...",
    "explore.noPlansInArea": "No travel plans registered in this area yet.",
    "explore.moveMapToFind": "Move the map to find other places!",
    "explore.photoStyles": "Photo Styles",
    "explore.travelDetails": "Travel Details",
    "explore.startDate": "Start:",
    "explore.endDate": "End:",
    "explore.duration": "Duration:",
    "explore.planType": "Plan Type:",
    "explore.free": "Free",
    "explore.viewOnMap": "🗺️ View closer on map",
    "explore.receivedOffers": "Received offers",
    "explore.sendOffer": "Send Offer →",
    "explore.days": "days",

    // Profile Error Messages
    "error.profile.notFound": "Profile not found. Please complete your profile setup first.",
    "error.profile.missing": "Your profile is incomplete. Please contact support.",
    "error.profile.offerFailed": "Cannot send offer: Profile setup required.",
  },
  ko: {
    // Navigation (already exists above)
    "lang.korean": "한국어",
    "lang.english": "English",

    // Home page
    "home.title": "CoSnap - 여행자들의 사진 교환 커뮤니티",
    "home.description":
      "여행자들이 서로의 사진을 찍어주는 CoSnap! 새로운 사람들을 만나고 잊지 못할 순간들을 함께 담아보세요.",
    "home.howItWorks.title": "CoSnap은 이렇게 작동해요",
    "home.howItWorks.subtitle": "간단한 4단계로 새로운 여행 경험을 시작하세요",
    "home.howItWorks.step1.title": "Flag 생성",
    "home.howItWorks.step1.desc":
      "여행 계획을 Flag로 등록하고 다른 여행자들에게 알리세요",
    "home.howItWorks.step2.title": "Offer 교환",
    "home.howItWorks.step2.desc":
      "마음에 드는 여행자에게 오퍼를 보내거나 받으세요",
    "home.howItWorks.step3.title": "Match 성사",
    "home.howItWorks.step3.desc":
      "오퍼가 수락되면 매치가 확정되고 만남을 약속해요",
    "home.howItWorks.step4.title": "Focus 획득",
    "home.howItWorks.step4.desc":
      "성공적인 CoSnap 후 서로 리뷰를 남기고 Focus를 쌓아요",

    "home.whyCoSnap.title": "왜 CoSnap인가요?",
    "home.whyCoSnap.subtitle":
      "신뢰 기반의 커뮤니티에서 안전하고 즐거운 여행 경험을 만나보세요",
    "home.whyCoSnap.focus.title": "Focus 시스템",
    "home.whyCoSnap.focus.desc":
      "신뢰도 점수로 안전한 커뮤니티를 구축합니다. 성공적인 CoSnap일수록 Focus가 올라가요.",
    "home.whyCoSnap.planning.title": "계획 기반 매칭",
    "home.whyCoSnap.planning.desc":
      "여행 계획을 미리 공유하고 신중하게 파트너를 선택하세요. 실시간 매칭보다 더 안전하고 깊이 있는 교류가 가능해요.",
    "home.whyCoSnap.premium.title": "프리미엄 혜택",
    "home.whyCoSnap.premium.desc":
      "프리미엄으로 더 많은 기회와 편리함을 누리세요. 언제든지 여행 계획을 만들고 수정할 수 있어요.",

    "home.activeFlags.title": "현재 활성화된 여행 계획",
    "home.activeFlags.subtitle":
      "다른 여행자들의 실제 여행 계획을 확인하고 CoSnap을 신청해보세요",
    "home.activeFlags.noFlags": "아직 활성화된 여행 계획이 없습니다",
    "home.activeFlags.createFirst": "첫 여행 계획 만들기",
    "home.activeFlags.viewDetails": "자세히 보기 →",
    "home.activeFlags.premium": "프리미엄",
    "home.activeFlags.regular": "일반",

    "home.topProfiles.title": "Top CoSnap 사용자",
    "home.topProfiles.subtitle":
      "높은 Focus 점수를 보유한 신뢰할 수 있는 사용자들",
    "home.topProfiles.equipment": "장비:",
    "home.topProfiles.style": "스타일:",
    "home.topProfiles.languages": "언어:",

    "home.testimonials.title": "CoSnap 사용자 후기",
    "home.testimonials.subtitle": "실제 사용자들의 생생한 경험담",

    "home.cta.title": "당신의 다음 여행에 CoSnap을 더하세요",
    "home.cta.subtitle":
      "새로운 사람들을 만나고 잊지 못할 순간들을 함께 담아보세요. 지금 바로 여행 계획을 만들어보세요!",
    "home.cta.getStarted": "무료로 시작하기",

    // Flag Card
    "flagCard.status.active": "활성",
    "flagCard.status.hidden": "숨김",
    "flagCard.status.expired": "만료",
    "flagCard.photoStyle": "선호 사진 스타일",
    "flagCard.sentOffers": "보낸 오퍼",
    "flagCard.receivedOffers": "받은 오퍼",
    "flagCard.count": "개",
    "flagCard.edit": "수정하기",
    "flagCard.delete": "삭제하기",

    // Offer Modal
    "offerModal.title": "오퍼 보내기",
    "offerModal.messageLabel": "소개 메시지",
    "offerModal.datesLabel": "희망 날짜",
    "offerModal.photoStylesLabel": "선호 사진 스타일",
    "offerModal.locationLabel": "희망 장소",
    "offerModal.success": "오퍼가 성공적으로 전송되었습니다!",
    "offerModal.error.minMessage": "메시지는 최소 20자 이상이어야 합니다",
    "offerModal.error.messageRequired": "메시지를 입력해주세요",
    "offerModal.error.datesRequired": "희망 날짜를 최소 1개 이상 선택해주세요",
    "offerModal.error.photoStylesRequired": "선호 사진 스타일을 최소 1개 이상 선택해주세요",
    "offerModal.error.locationRequired": "희망 장소를 입력해주세요",
    "offerModal.sending": "전송 중...",
    "offerModal.send": "오퍼 보내기",
    "offerModal.cancel": "취소",
    "offerModal.photoStyle.portrait": "인물 사진",
    "offerModal.photoStyle.landscape": "풍경 사진",
    "offerModal.photoStyle.street": "거리 사진",
    "offerModal.photoStyle.food": "음식 사진",
    "offerModal.photoStyle.night": "야경 사진",
    "offerModal.photoStyle.architecture": "건축 사진",
    "offerModal.photoStyle.candid": "자연스러운 순간",
    "offerModal.photoStyle.cultural": "문화/축제",

    // Focus Meter
    "focusMeter.tier.blurry": "흐릿",
    "focusMeter.tier.focusing": "집중",
    "focusMeter.tier.clear": "명선",
    "focusMeter.tier.crystal": "크리스탈",
    "focusMeter.nextTierPoints": "다음 티어까지 ",
    "focusMeter.points": "점",
    "characters": "자",

    // Navigation
    "nav.home": "홈",
    "nav.explore": "여행자 찾기",
    "nav.flags": "Flags 만들기",
    "nav.matches": "매치",
    "nav.profile": "프로필",
    "nav.logout": "로그아웃",
    "nav.login": "로그인",
    "nav.signup": "회원가입",

    // Flags Page
    "flags.title": "내 여행 계획",
    "flags.description": "여행 계획(Flag)을 생성하고 관리하세요",
    "flags.notification.created": "Flag가 생성되었습니다!",
    "flags.notification.updated": "Flag가 수정되었습니다!",
    "flags.notification.deleted": "Flag가 삭제되었습니다!",
    "flags.createButton": "새 여행 계획 만들기",
    "flags.processing": "처리 중...",
    "flags.activeSection": "예정된 여행",
    "flags.pastSection": "지난 여행",
    "flags.emptyActive": "예정된 여행 계획이 없습니다",
    "flags.emptyActiveSub": "새로운 Flag를 만들어 여행 계획을 공유해보세요",
    "flags.emptyPast": "지난 여행 기록이 없습니다",
    "flags.emptyPastSub": "첫 CoSnap을 시작해보세요!",
    "flags.deleteConfirm": "정말로 이 Flag를 삭제하시겠습니까?",
    "flags.premium.title": "프리미엄으로 업그레이드",
    "flags.premium.desc": "언제든지 여행 계획을 만들고 수정하세요",
    "flags.premium.learnMore": "알아보기",

    // Flag Form
    "flagForm.country.japan": "🇯🇵 일본",
    "flagForm.country.korea": "🇰🇷 한국",
    "flagForm.country.usa": "🇺🇸 미국",
    "flagForm.country.france": "🇫🇷 프랑스",
    "flagForm.country.italy": "🇮🇹 이탈리아",
    "flagForm.country.uk": "🇬🇧 영국",
    "flagForm.country.china": "🇨🇳 중국",
    "flagForm.country.thailand": "🇹🇭 태국",
    "flagForm.country.vietnam": "🇻🇳 베트남",
    "flagForm.country.taiwan": "🇹🇼 대만",
    "flagForm.language.korean": "한국어",
    "flagForm.language.english": "English",
    "flagForm.language.japanese": "日本語",
    "flagForm.language.chinese": "中文",
    "flagForm.language.french": "Français",
    "flagForm.language.spanish": "Español",
    "flagForm.error.cityRequired": "도시를 입력해주세요",
    "flagForm.error.countryRequired": "국가를 선택해주세요",
    "flagForm.error.startDateRequired": "시작일을 선택해주세요",
    "flagForm.error.endDateRequired": "종료일을 선택해주세요",
    "flagForm.error.startDateFuture": "시작일은 오늘 이후여야 합니다",
    "flagForm.error.endDateAfterStart": "종료일은 시작일 이후여야 합니다",
    "flagForm.error.maxDuration": "여행 기간은 1년을 초과할 수 없습니다",
    "flagForm.error.photoStylesRequired":
      "선호 사진 스타일을 최소 1개 이상 선택해주세요",
    "flagForm.error.languagesRequired":
      "사용 가능 언어를 최소 1개 이상 선택해주세요",
    "flagForm.error.noteTooLong": "메모는 500자를 초과할 수 없습니다",
    "flagForm.success.updated": "Flag가 수정되었습니다!",
    "flagForm.success.created": "Flag가 생성되었습니다!",
    "flagForm.error.updateFailed": "수정",
    "flagForm.error.createFailed": "생성",
    "flagForm.error.failedSuffix": "에 실패했습니다. 다시 시도해주세요.",

    // Explore Page
    "explore.title": "여행 계획 찾기",
    "explore.selectDestination": "여행지 선택...",
    "explore.goToMap": "지도로 이동",
    "explore.currentLocation": "📍 현재 내 위치로 이동",
    "explore.travelPlansInArea": "이 지역의 여행 계획",
    "explore.count": "개",
    "explore.loadingMap": "지도를 불러오는 중입니다...",
    "explore.noPlansInArea": "이 지역에는 아직 등록된 여행 계획이 없어요.",
    "explore.moveMapToFind": "지도를 움직여 다른 곳을 찾아보세요!",
    "explore.photoStyles": "사진 스타일",
    "explore.travelDetails": "여행 상세 정보",
    "explore.startDate": "시작일:",
    "explore.endDate": "종료일:",
    "explore.duration": "여행 기간:",
    "explore.planType": "플랜 타입:",
    "explore.free": "무료",
    "explore.viewOnMap": "🗺️ 지도에서 가까이 보기",
    "explore.receivedOffers": "받은 오퍼",
    "explore.sendOffer": "오퍼 보내기 →",
    "explore.days": "일",

    // Profile Error Messages
    "error.profile.notFound": "프로필을 찾을 수 없습니다. 먼저 프로필 설정을 완료해주세요.",
    "error.profile.missing": "프로필이 불완전합니다. 지원팀에 문의해주세요.",
    "error.profile.offerFailed": "오퍼를 보낼 수 없습니다: 프로필 설정이 필요합니다.",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then default to Korean
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      return saved || "ko";
    }
    return "ko";
  });

  useEffect(() => {
    // Save language preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const t = (key: string): string => {
    if (!translations[language]) {
      console.warn(`Language "${language}" not found in translations`);
      return key;
    }
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
