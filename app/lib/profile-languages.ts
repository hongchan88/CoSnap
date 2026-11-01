const languageCodes: Record<string, string> = {
  ko: "ko", korean: "ko", "한국어": "ko",
  en: "en", english: "en", "영어": "en",
  ja: "ja", japanese: "ja", "日本語": "ja", "일본어": "ja",
  zh: "zh", chinese: "zh", mandarin: "zh", "中文": "zh", "중국어": "zh",
  fr: "fr", french: "fr", "français": "fr", "프랑스어": "fr",
  es: "es", spanish: "es", "español": "es", "스페인어": "es",
  de: "de", german: "de", deutsch: "de", "독일어": "de",
  it: "it", italian: "it", italiano: "it", "이탈리아어": "it",
  pt: "pt", portuguese: "pt", "português": "pt", "포르투갈어": "pt",
  ru: "ru", russian: "ru", "русский": "ru", "러시아어": "ru",
};

// Match existing names to checkbox codes without dropping unsupported languages.
export function normalizeProfileLanguages(values: readonly string[]): string[] {
  return [...new Set(values.map(value => {
    const trimmed = value.trim();
    return languageCodes[trimmed.toLowerCase()] ?? trimmed;
  }).filter(Boolean))];
}
