export const SUPPORTED_LANGUAGES = ["en", "ko"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export function getStoredLanguage(value: string | null): Language {
  return value === "ko" || value === "en" ? value : DEFAULT_LANGUAGE;
}

export function readStoredLanguage(storage: Pick<Storage, "getItem">): Language {
  try { return getStoredLanguage(storage.getItem("language")); }
  catch { return DEFAULT_LANGUAGE; }
}

export function persistLanguage(storage: Pick<Storage, "setItem">, language: Language): void {
  try { storage.setItem("language", language); } catch { /* Language remains usable in memory. */ }
}

export function localizedPageTitle(pathname: string, language: Language): string | null {
  const names: Record<string, [string, string]> = {
    "/": ["CoSnap Connect - Community Where Travelers Rely on Each Other", "CoSnap Connect - 서로 의지하는 여행자 커뮤니티"],
    "/login": ["Log in - CoSnap", "로그인 - CoSnap"],
    "/signup": ["Sign up - CoSnap", "회원가입 - CoSnap"],
  };
  return names[pathname]?.[language === "ko" ? 1 : 0] ?? null;
}
