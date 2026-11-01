export function formatTravelDate(value: unknown, language: string): string {
  if (!(typeof value === "string" || value instanceof Date) || value === "") {
    return language === "ko" ? "날짜 미정" : "Date pending";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return language === "ko" ? "날짜 미정" : "Date pending";
  }
  return date.toLocaleDateString(language === "ko" ? "ko-KR" : "en-US", {
    timeZone: "UTC",
  });
}
