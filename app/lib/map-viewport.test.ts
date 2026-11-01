import assert from "node:assert/strict";
import test from "node:test";
import { canReportMapViewport } from "./map-viewport.ts";

test("hiding the mobile map preserves the last visible search bounds", () => {
  const visible = { south: 37.1, north: 37.8, west: 126.5, east: 127.3 };
  let search = visible;
  const hidden = { south: 37.44, north: 37.44, west: 126.9141, east: 126.9141 };
  if (canReportMapViewport(0, 0, hidden.south, hidden.north, hidden.west, hidden.east)) search = hidden;
  assert.deepEqual(search, visible);
  assert.equal(canReportMapViewport(390, 700, visible.south, visible.north, visible.west, visible.east), true);
});

test("collapsed, hidden and invalid map regions never become search requests", () => {
  assert.equal(canReportMapViewport(0, 700, 37, 38, 126, 127), false);
  assert.equal(canReportMapViewport(390, 0, 37, 38, 126, 127), false);
  assert.equal(canReportMapViewport(390, 700, 37, 37, 126, 126), false);
  assert.equal(canReportMapViewport(390, 700, NaN, 38, 126, 127), false);
  assert.equal(canReportMapViewport(390, 700, -20, 20, 170, 200), true);
});
