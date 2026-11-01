import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProfileLanguages } from "./profile-languages.ts";

test("existing demo language names preselect the corresponding profile options", () => {
  assert.deepEqual(normalizeProfileLanguages(["Korean", "English"]), ["ko", "en"]);
  assert.deepEqual(normalizeProfileLanguages(["한국어", "日本語", "Français", "Español"]), ["ko", "ja", "fr", "es"]);
});

test("mixed codes and names do not create duplicates or lose unsupported user languages", () => {
  const stored = [" Korean ", "ko", "EN", "English", "Thai", "Cantonese", ""];
  assert.deepEqual(normalizeProfileLanguages(stored), ["ko", "en", "Thai", "Cantonese"]);
  assert.equal(stored[0], " Korean ");
  assert.deepEqual(normalizeProfileLanguages([]), []);
});
