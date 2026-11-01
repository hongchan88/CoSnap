import assert from "node:assert/strict";
import test from "node:test";
import { formatTravelDate } from "./travel-date.ts";

test("formats database date strings consistently across server and browser timezones", () => {
  assert.equal(formatTravelDate("2026-11-01T00:00:00.000Z", "en"), "11/1/2026");
  assert.equal(formatTravelDate("2026-11-01", "en"), "11/1/2026");
});

test("missing and corrupt dates have a readable fallback", () => {
  for (const value of [undefined, null, "", "not-a-date", new Date(NaN)]) {
    assert.equal(formatTravelDate(value, "en"), "Date pending");
    assert.equal(formatTravelDate(value, "ko"), "날짜 미정");
  }
});
