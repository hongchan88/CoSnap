import assert from "node:assert/strict";
import test from "node:test";
import { parseExploreDates } from "./explore-dates.ts";

test("inclusive date search covers the entire selected UTC days", () => {
  assert.deepEqual(parseExploreDates("2026-11-01", "2026-11-02"), {
    valid: true, start: "2026-11-01T00:00:00.000Z", end: "2026-11-02T23:59:59.999Z",
  });
  assert.equal(parseExploreDates("2026-11-01", "2026-11-01").valid, true);
  assert.deepEqual(parseExploreDates(null, null), { valid: true, start: null, end: null });
  assert.equal(parseExploreDates(null, "2026-11-02").start, null);
});

test("invalid and reversed dates are rejected before querying the database", () => {
  for (const pair of [["2026-02-30", null], ["not-a-date", null], ["2026-11-02", "2026-11-01"], ["2026-2-01", null]]) {
    assert.equal(parseExploreDates(pair[0], pair[1]).valid, false);
  }
});
