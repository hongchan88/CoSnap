import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_LANGUAGE, getStoredLanguage, readStoredLanguage, persistLanguage, localizedPageTitle } from "./language.ts";

test("defaults first-time visitors to English", () => {
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.equal(getStoredLanguage(null), "en");
});

test("accepts only supported stored language values", () => {
  assert.equal(getStoredLanguage("ko"), "ko");
  assert.equal(getStoredLanguage("en"), "en");
  assert.equal(getStoredLanguage("korean"), "en");
});


test("selection survives navigation reload without overwriting stored preference", () => {
  const values = new Map<string, string>([["language", "ko"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.equal(readStoredLanguage(storage), "ko");
  persistLanguage(storage, "en");
  assert.equal(readStoredLanguage(storage), "en");
  assert.equal(localizedPageTitle("/login", "en"), "Log in - CoSnap");
  assert.equal(localizedPageTitle("/signup", "ko"), "회원가입 - CoSnap");
  assert.doesNotMatch(localizedPageTitle("/", "en")!, /[가-힣]/);
});

test("blocked storage does not break language selection", () => {
  const storage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(readStoredLanguage(storage), "en");
  assert.doesNotThrow(() => persistLanguage(storage, "ko"));
});
