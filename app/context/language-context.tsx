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
    "home.title": "CoSnap Connect - Community Where Travelers Rely on Each Other",
    "home.description":
      "From travel help and advice to sharing hobbies. A community where travelers and locals help each other through any difficulty.",
    "home.howItWorks.title": "How CoSnap Connect Works",
    "home.howItWorks.subtitle":
      "Get help, meet people, and share resources in 4 steps",
    "home.howItWorks.step1.title": "Discover",
    "home.howItWorks.step1.desc":
      "Find help requests, meetups, and free items on the map",
    "home.howItWorks.step2.title": "Post & Flag",
    "home.howItWorks.step2.desc":
      "Create posts for help, travel advice, or hobbies. Premium users can drop flags anywhere.",
    "home.howItWorks.step3.title": "Connect",
    "home.howItWorks.step3.desc":
      "DM directly to offer help or join events. Local experts can assist you.",
    "home.howItWorks.step4.title": "Review",
    "home.howItWorks.step4.desc":
      "Build trust with honest reviews after every interaction.",

    "home.whyCoSnap.title": "Community for Travelers",
    "home.whyCoSnap.subtitle":
      "Ever faced difficulties while traveling? Lean on each other with CoSnap.",
    "home.whyCoSnap.focus.title": "Trust via Reviews",
    "home.whyCoSnap.focus.desc":
      "Check user reviews and ratings before connecting. Honest feedback builds a safer community.",
    "home.whyCoSnap.planning.title": "Location-First",
    "home.whyCoSnap.planning.desc":
      "Everything is map-based. Find what you need exactly where you are or where you're going.",
    "home.whyCoSnap.premium.title": "Premium Features",
    "home.whyCoSnap.premium.desc":
      "Get 5 flags, place them anywhere, unlimited DMs, and priority visibility.",
    "home.whyCoSnap.premium.list1": "Unlimited DMs to connect freely",
    "home.whyCoSnap.premium.list2": "Create Unlimited Flags for every plan",
    "home.whyCoSnap.premium.list3": "Priority visibility to reach more locals",

    "home.activeFlags.title": "Live Community Activity",
    "home.activeFlags.subtitle":
      "See what's happening around you right now",
    "home.activeFlags.noFlags": "No active posts in this area",
    "home.activeFlags.createFirst": "Create the first Post",
    "home.activeFlags.viewDetails": "View Details →",
    "home.activeFlags.premium": "Premium",
    "home.activeFlags.regular": "Regular",

    "home.topProfiles.title": "Top Reviewed Users",
    "home.topProfiles.subtitle": "Trusted users with high ratings and reviews",
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

    // Review System
    "review.stars": "Stars",
    "review.count": "Reviews",
    "characters": "characters",

    // Navigation
    "nav.home": "Home",
    "nav.explore": "Find Travelers",
    "nav.flags": "Travel Plans",
    "nav.matches": "Matches",
    "nav.profile": "Profile",
    "nav.inbox": "Inbox",
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
    "flags.activeSection": "Current flags",
    "flags.pastSection": "Expired flags",
    "flags.emptyActive": "No upcoming travel plans",
    "flags.emptyActiveSub": "Create a new Flag to share your travel plan",
    "flags.emptyPast": "No past travel records",
    "flags.emptyPastSub": "Start your first CoSnap!",
    "flags.deleteConfirm": "Are you sure you want to delete this Flag?",
    "flags.premium.title": "Upgrade to Premium",
    "flags.premium.desc": "Create and modify travel plans anytime",
    "flags.premium.learnMore": "Learn More",

    // Flag Form
    "flagForm.title": "Create Flag",
    "flagForm.editTitle": "Edit Flag",
    "flagForm.type": "Flag Type",
    "flagForm.city": "City",
    "flagForm.cityPlaceholder": "e.g., Tokyo",
    "flagForm.country": "Country",
    "flagForm.countryPlaceholder": "Select a country",
    "flagForm.titleLabel": "Title",
    "flagForm.titlePlaceholder": "Enter a title for your plan",
    "flagForm.startDate": "Start Date",
    "flagForm.endDate": "End Date",
    "flagForm.description": "Description",
    "flagForm.descriptionPlaceholder": "Describe your plan...",
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

    // Profile Page
    "profile.title": "Profile",
    "profile.description": "Manage your profile and check CoSnap activity",
    "profile.tabs.profile": "Profile",
    "profile.tabs.messages": "Messages",
    "profile.noMessages": "No messages yet",
    "profile.noMessagesSub": "You have no new messages",
    "profile.goToInbox": "Go to Inbox",

    // Inbox Page
    "inbox.title": "Inbox",
    "inbox.description": "View your messages and notifications",
    "inbox.receivedOffers": "Received Offers",
    "inbox.sentOffers": "Sent Offers",
    "inbox.noReceivedOffers": "No received offers yet",
    "inbox.noSentOffers": "No sent offers yet",
    "inbox.exploreDestinations": "Explore Destinations",
    "inbox.destination": "Destination",
    "inbox.to": "To:",
    "inbox.status.pending": "Pending",
    "inbox.status.accepted": "Accepted",
    "inbox.status.declined": "Declined",
    "inbox.status.cancelled": "Cancelled",
    "inbox.status.expired": "Expired",
    "inbox.accept": "Accept",
    "inbox.decline": "Decline",
    "inbox.cancel": "Cancel",

    // Common
    "common.loadMore": "Load More",
    "common.loading": "Loading...",

    // Flag Types
    "flagType.meet": "👋 Meetup",
    "flagType.help": "🙏 Help Request",
    "flagType.emergency": "Emergency",
    "flagType.free": "Free/Sharing",
    "flagType.photo": "Photo Shoot",
    "flagType.offer": "Offer Help",
    "flagType.other": "Other",
  },
  ko: {
    // Navigation (already exists above)
    "lang.korean": "한국어",
    "lang.english": "English",

    // Home page
    "home.title": "CoSnap Connect - 서로 의지하는 여행자 커뮤니티",
    "home.description":
      "여행 중 겪는 어려움, 도움, 조언, 그리고 취미 생활까지. 현지인과 여행자가 서로 돕는 따뜻한 커뮤니티, CoSnap입니다.",
    "home.howItWorks.title": "CoSnap Connect 이용 방법",
    "home.howItWorks.subtitle": "도움, 만남, 나눔을 위한 간단한 4단계",
    "home.howItWorks.step1.title": "탐색 (Discover)",
    "home.howItWorks.step1.desc":
      "지도 위에서 도움 요청, 번개 모임, 무료 나눔을 찾아보세요",
    "home.howItWorks.step2.title": "등록 (Post & Flag)",
    "home.howItWorks.step2.desc":
      "도움이 필요하거나 취미를 공유하고 싶을 때 글을 남기세요. 프리미엄은 어디든 Flag를 꽂을 수 있어요.",
    "home.howItWorks.step3.title": "연결 (Connect)",
    "home.howItWorks.step3.desc":
      "현지인에게 도움을 요청하거나, 여행자들과 서로 의지하세요.",
    "home.howItWorks.step4.title": "리뷰 (Review)",
    "home.howItWorks.step4.desc":
      "활동 후 서로에게 리뷰를 남겨주세요. 솔직한 리뷰가 신뢰를 만듭니다.",

    "home.whyCoSnap.title": "여행자를 위한 커뮤니티",
    "home.whyCoSnap.subtitle":
      "여행하면서 어려움을 겪으신 적 있나요? 이제 CoSnap에서 서로 의지하세요.",
    "home.whyCoSnap.focus.title": "리뷰 기반의 신뢰",
    "home.whyCoSnap.focus.desc":
      "사용자의 리뷰와 평점을 미리 확인하세요. 검증된 여행자와 안전하게 만날 수 있습니다.",
    "home.whyCoSnap.planning.title": "위치 기반 리얼타임",
    "home.whyCoSnap.planning.desc":
      "모든 정보는 지도 위에 있습니다. 내 주변의 도움과 만남을 직관적으로 확인하세요.",
    "home.whyCoSnap.premium.title": "프리미엄 혜택",
    "home.whyCoSnap.premium.desc":
      "5개의 Flag, 자유로운 위치 설정, 무제한 DM, 그리고 우선 노출 혜택을 누리세요.",
    "home.whyCoSnap.premium.list1": "자유로운 소통을 위한 무제한 DM",
    "home.whyCoSnap.premium.list2": "모든 계획을 담을 수 있는 무제한 Flag",
    "home.whyCoSnap.premium.list3": "내 글이 더 잘 보이는 우선 노출 혜택",

    "home.activeFlags.title": "실시간 커뮤니티 활동",
    "home.activeFlags.subtitle":
      "지금 주변에서 일어나고 있는 일들을 확인해보세요",
    "home.activeFlags.noFlags": "아직 이 주변에 활동이 없습니다",
    "home.activeFlags.createFirst": "첫 활동 시작하기",
    "home.activeFlags.viewDetails": "자세히 보기 →",
    "home.activeFlags.premium": "프리미엄",
    "home.activeFlags.regular": "일반",

    "home.topProfiles.title": "베스트 리뷰 유저",
    "home.topProfiles.subtitle":
      "좋은 평판과 많은 리뷰를 보유한 신뢰할 수 있는 사용자들",
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

    // Review System
    "review.stars": "별점",
    "review.count": "개의 리뷰",
    "characters": "자",

    // Navigation
    "nav.home": "홈",
    "nav.explore": "여행자 찾기",
    "nav.flags": "여행 계획",
    "nav.matches": "매치",
    "nav.profile": "프로필",
    "nav.inbox": "인박스",
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
    "flags.activeSection": "현재 flags",
    "flags.pastSection": "만료된 flags",
    "flags.emptyActive": "예정된 여행 계획이 없습니다",
    "flags.emptyActiveSub": "새로운 Flag를 만들어 여행 계획을 공유해보세요",
    "flags.emptyPast": "지난 여행 기록이 없습니다",
    "flags.emptyPastSub": "첫 CoSnap을 시작해보세요!",
    "flags.deleteConfirm": "정말로 이 Flag를 삭제하시겠습니까?",
    "flags.premium.title": "프리미엄으로 업그레이드",
    "flags.premium.desc": "언제든지 여행 계획을 만들고 수정하세요",
    "flags.premium.learnMore": "알아보기",

    // Flag Form
    "flagForm.title": "Flag 만들기",
    "flagForm.editTitle": "Flag 수정하기",
    "flagForm.type": "Flag 유형",
    "flagForm.city": "도시",
    "flagForm.cityPlaceholder": "예: 도쿄",
    "flagForm.country": "국가",
    "flagForm.countryPlaceholder": "국가를 선택해주세요",
    "flagForm.titleLabel": "제목",
    "flagForm.titlePlaceholder": "계획의 제목을 입력하세요",
    "flagForm.startDate": "시작일",
    "flagForm.endDate": "종료일",
    "flagForm.description": "설명",
    "flagForm.descriptionPlaceholder": "계획을 설명해주세요...",
    "flagForm.note": "메모 (선택사항)",
    "flagForm.notePlaceholder": "특별한 요청이나 선호사항을 자유롭게 작성해주세요...",
    "flagForm.photoStyle": "선호 사진 스타일",
    "flagForm.languages": "사용 가능 언어",
    "flagForm.location": "위치 선택 (선택사항)",
    "flagForm.cancel": "취소",
    "flagForm.create": "만들기",
    "flagForm.update": "수정하기",
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


    // Profile Page
    "profile.title": "프로필",
    "profile.description": "프로필 정보를 관리하고 CoSnap 활동을 확인하세요",
    "profile.tabs.profile": "프로필",
    "profile.tabs.messages": "메세지",
    "profile.noMessages": "메세지가 없습니다",
    "profile.noMessagesSub": "새로운 메세지가 없습니다",
    "profile.goToInbox": "인박스로 이동",

    // Profile Error Messages
    "error.profile.notFound": "프로필을 찾을 수 없습니다. 먼저 프로필 설정을 완료해주세요.",
    "error.profile.missing": "프로필이 불완전합니다. 지원팀에 문의해주세요.",
    "error.profile.offerFailed": "오퍼를 보낼 수 없습니다: 프로필 설정이 필요합니다.",

    // Inbox Page
    "inbox.title": "인박스",
    "inbox.description": "메시지와 알림을 확인하세요",
    "inbox.receivedOffers": "받은 오퍼",
    "inbox.sentOffers": "보낸 오퍼",
    "inbox.noReceivedOffers": "아직 받은 오퍼가 없습니다",
    "inbox.noSentOffers": "아직 보낸 오퍼가 없습니다",
    "inbox.exploreDestinations": "여행지 둘러보기",
    "inbox.destination": "여행지",
    "inbox.to": "수신자:",
    "inbox.status.pending": "대기중",
    "inbox.status.accepted": "수락됨",
    "inbox.status.declined": "거절됨",
    "inbox.status.cancelled": "취소됨",
    "inbox.status.expired": "만료됨",
    "inbox.accept": "수락하기",
    "inbox.decline": "거절하기",
    "inbox.cancel": "취소하기",

    // Common
    "common.loadMore": "더 보기",
    "common.loading": "로딩 중...",

    // Flag Types
    "flagType.meet": "👋 번개/모임",
    "flagType.help": "🙏 Help 요청",
    "flagType.emergency": "긴급",
    "flagType.free": "나눔/무료",
    "flagType.photo": "사진 촬영",
    "flagType.offer": "도움 제안",
    "flagType.other": "기타",
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
