import assert from "node:assert/strict";
import test from "node:test";
import { authTranslations, validateAuthForm, getAuthErrorKey } from "./auth-translations.ts";

const form = (values: Record<string, string>) => { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data; };

test("auth dictionary has matching bilingual coverage and English text", () => {
  assert.deepEqual(Object.keys(authTranslations.en), Object.keys(authTranslations.ko));
  assert.ok(Object.values(authTranslations.en).every(value => !/[가-힣]/.test(value)));
  assert.equal(authTranslations.en["auth.login"], "Log in");
});

test("validation returns stable keys that can change language after submission", () => {
  const missing = validateAuthForm(form({ language: "ko" }), "signup");
  assert.equal(missing.language, "ko");
  assert.equal(missing.errorKey, "auth.error.required");
  assert.equal(validateAuthForm(form({ language: "invalid" }), "login").language, "en");
  const fields = {email: "a@example.com", password: "secret123", confirmPassword: "secret123", username: "Traveler", language: "en"};
  assert.equal(validateAuthForm(form(fields), "signup").errorKey, null);
  assert.equal(validateAuthForm(form({...fields,email:"bad"}), "login").errorKey, "auth.error.email");
  assert.equal(validateAuthForm(form({...fields,password:"short"}), "login").errorKey, "auth.error.passwordLength");
  assert.equal(validateAuthForm(form({...fields,confirmPassword:"different"}), "signup").errorKey, "auth.error.passwordMismatch");
});

test("backend error messages are never shown as untranslated provider text", () => {
  assert.equal(getAuthErrorKey({code:"invalid_credentials",message:"한국어"}, "login"), "auth.error.credentials");
  assert.equal(getAuthErrorKey({code:"email_not_confirmed"}, "login"), "auth.error.emailNotConfirmed");
  assert.equal(getAuthErrorKey({message:"private provider detail"}, "signup"), "auth.error.signup");
  assert.equal(getAuthErrorKey(null,"google"), "auth.error.google");
});
