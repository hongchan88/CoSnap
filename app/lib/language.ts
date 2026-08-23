export const SUPPORTED_LANGUAGES = ["en", "ko"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export function getStoredLanguage(value: string | null): Language {
  return value === "ko" || value === "en" ? value : DEFAULT_LANGUAGE;
}
