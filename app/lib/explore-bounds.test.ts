import assert from "node:assert/strict";
import test from "node:test";
import { normalizeExploreBounds, containsExplorePoint } from "./explore-bounds.ts";

test("a viewport crossing the date line includes both sides of the Pacific", () => {
  const bounds = normalizeExploreBounds(-30, 30, 170, 200);
  assert.equal(containsExplorePoint(bounds, 0, 175), true);
  assert.equal(containsExplorePoint(bounds, 0, -175), true);
  assert.equal(containsExplorePoint(bounds, 0, 0), false);
  assert.equal(containsExplorePoint(bounds, 40, 175), false);
});

test("whole-world and wrapped map copies produce canonical bounds", () => {
  assert.deepEqual(normalizeExploreBounds(-95, 95, -240, 240), { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 });
  const bounds = normalizeExploreBounds(30, 40, 480, 500);
  assert.equal(containsExplorePoint(bounds, 35, 130), true);
  assert.equal(containsExplorePoint(bounds, 35, -100), false);
});
