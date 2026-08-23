import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_LANGUAGE, getStoredLanguage } from "./language.ts";

test("defaults first-time visitors to English", () => {
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.equal(getStoredLanguage(null), "en");
});

test("accepts only supported stored language values", () => {
  assert.equal(getStoredLanguage("ko"), "ko");
  assert.equal(getStoredLanguage("en"), "en");
  assert.equal(getStoredLanguage("korean"), "en");
});
