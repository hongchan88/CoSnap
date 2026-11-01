import { getStoredLanguage } from "./language.ts";

export const authTranslations = {
  en: {
    "auth.demo.title": "Try the portfolio demo",
    "auth.demo.description": "Explore with a shared demo account. Other visitors can see its activity; please do not enter personal or sensitive information.",
    "auth.demo.fill": "Fill demo account",
    "auth.demo.hint": "This fills the form only. Choose Log in when you are ready.",
    "auth.login": "Log in",
    "auth.signup": "Sign up",
    "auth.loginDescription": "Log in to CoSnap to share your travel plans.",
    "auth.signupDescription": "Join CoSnap and meet new travel companions.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.confirmPassword": "Confirm password",
    "auth.emailPlaceholder": "Enter your email address",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.newPasswordPlaceholder": "Password (at least 6 characters)",
    "auth.usernamePlaceholder": "Enter your username",
    "auth.confirmPlaceholder": "Enter your password again",
    "auth.loggingIn": "Logging in…",
    "auth.signingUp": "Signing up…",
    "auth.or": "or",
    "auth.googleLogin": "Continue with Google",
    "auth.googleSignup": "Sign up with Google",
    "auth.googleLoading": "Connecting to Google…",
    "auth.noAccount": "Don’t have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.welcome": "Welcome to CoSnap!",
    "auth.processing": "Completing sign-in…",
    "auth.pleaseWait": "Please wait a moment.",
    "auth.signupSuccess": "Account created. Check your inbox if email confirmation is required, then log in.",
    "auth.error.required": "Please complete all fields.",
    "auth.error.email": "Enter a valid email address.",
    "auth.error.passwordLength": "Your password must be at least 6 characters.",
    "auth.error.passwordMismatch": "Passwords do not match.",
    "auth.error.credentials": "Email or password is incorrect.",
    "auth.error.emailNotConfirmed": "Confirm your email before logging in.",
    "auth.error.rateLimit": "Too many attempts. Please try again later.",
    "auth.error.emailInUse": "An account with this email already exists. Try logging in.",
    "auth.error.login": "Could not log in. Please try again.",
    "auth.error.signup": "Could not create your account. Please try again.",
    "auth.error.google": "Could not connect to Google. Please try again.",
    "auth.error.callback": "Sign-in could not be completed. Please try again.",
  },
  ko: {
    "auth.demo.title": "포트폴리오 데모 체험",
    "auth.demo.description": "공유 데모 계정으로 둘러보세요. 다른 방문자도 활동을 볼 수 있으니 개인정보나 민감한 내용은 입력하지 마세요.",
    "auth.demo.fill": "데모 계정 채우기",
    "auth.demo.hint": "입력란만 채웁니다. 준비되면 로그인을 눌러 주세요.",
    "auth.login": "로그인",
    "auth.signup": "회원가입",
    "auth.loginDescription": "CoSnap 계정에 로그인하여 여행 계획을 공유하세요.",
    "auth.signupDescription": "CoSnap에 가입하여 새로운 여행 친구들을 만나보세요.",
    "auth.email": "이메일",
    "auth.password": "비밀번호",
    "auth.username": "사용자 이름",
    "auth.confirmPassword": "비밀번호 확인",
    "auth.emailPlaceholder": "이메일 주소를 입력하세요",
    "auth.passwordPlaceholder": "비밀번호를 입력하세요",
    "auth.newPasswordPlaceholder": "비밀번호 (최소 6자)",
    "auth.usernamePlaceholder": "사용자 이름을 입력하세요",
    "auth.confirmPlaceholder": "비밀번호를 다시 입력하세요",
    "auth.loggingIn": "로그인 중…",
    "auth.signingUp": "가입 중…",
    "auth.or": "또는",
    "auth.googleLogin": "Google로 로그인",
    "auth.googleSignup": "Google로 가입",
    "auth.googleLoading": "Google 연결 중…",
    "auth.noAccount": "계정이 없으신가요?",
    "auth.hasAccount": "이미 계정이 있으신가요?",
    "auth.welcome": "CoSnap에 오신 것을 환영합니다!",
    "auth.processing": "인증 처리 중…",
    "auth.pleaseWait": "잠시만 기다려주세요.",
    "auth.signupSuccess": "계정이 생성되었습니다. 이메일 인증이 필요한 경우 받은편지함을 확인한 후 로그인해 주세요.",
    "auth.error.required": "모든 필드를 입력해 주세요.",
    "auth.error.email": "유효한 이메일 주소를 입력해 주세요.",
    "auth.error.passwordLength": "비밀번호는 최소 6자 이상이어야 합니다.",
    "auth.error.passwordMismatch": "비밀번호가 일치하지 않습니다.",
    "auth.error.credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth.error.emailNotConfirmed": "로그인 전에 이메일을 인증해 주세요.",
    "auth.error.rateLimit": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    "auth.error.emailInUse": "이미 등록된 이메일입니다. 로그인해 주세요.",
    "auth.error.login": "로그인하지 못했습니다. 다시 시도해 주세요.",
    "auth.error.signup": "계정을 생성하지 못했습니다. 다시 시도해 주세요.",
    "auth.error.google": "Google에 연결하지 못했습니다. 다시 시도해 주세요.",
    "auth.error.callback": "인증을 완료하지 못했습니다. 다시 시도해 주세요.",
  },
} as const;

export type AuthErrorKey = keyof typeof authTranslations.en;

export function validateAuthForm(form: FormData, mode: "login" | "signup") {
  const language = getStoredLanguage(typeof form.get("language") === "string" ? form.get("language") as string : null);
  const text = (key: string) => typeof form.get(key) === "string" ? form.get(key) as string : "";
  const values = { email: text("email").trim(), password: text("password"), username: text("username").trim(), confirmPassword: text("confirmPassword") };
  let errorKey: AuthErrorKey | null = null;
  if (!values.email || !values.password || (mode === "signup" && (!values.username || !values.confirmPassword))) errorKey = "auth.error.required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errorKey = "auth.error.email";
  else if (values.password.length < 6) errorKey = "auth.error.passwordLength";
  else if (mode === "signup" && values.password !== values.confirmPassword) errorKey = "auth.error.passwordMismatch";
  return { language, values, errorKey };
}

export function getAuthErrorKey(error: unknown, fallback: "login" | "signup" | "google"): AuthErrorKey {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  switch (code) {
    case "invalid_credentials": return "auth.error.credentials";
    case "email_not_confirmed": return "auth.error.emailNotConfirmed";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit": return "auth.error.rateLimit";
    case "user_already_exists":
    case "email_exists": return "auth.error.emailInUse";
    case "weak_password": return "auth.error.passwordLength";
    default: return `auth.error.${fallback}`;
  }
}
