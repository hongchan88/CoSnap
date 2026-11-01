export function parseExploreDates(startDate: string | null, endDate: string | null) {
  const validDate = (value: string | null) => !value || (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(new Date(value).getTime()) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
  const valid = validDate(startDate) && validDate(endDate) &&
    !(startDate && endDate && startDate > endDate);
  return {
    valid,
    start: valid && startDate ? `${startDate}T00:00:00.000Z` : null,
    end: valid && endDate ? `${endDate}T23:59:59.999Z` : null,
  };
}
