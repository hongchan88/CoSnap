import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { PUBLIC_DEMO_ACCOUNT } from "./demo-account.ts";
import { authTranslations, validateAuthForm } from "./auth-translations.ts";

test("public demo account stays aligned with the existing synthetic seed credentials", () => {
  const seed = fs.readFileSync(new URL("../../scripts/seed-staging.mjs", import.meta.url), "utf8");
  const password = seed.match(/const DEMO_PASSWORD = "([^"]+)"/)?.[1];
  assert.equal(PUBLIC_DEMO_ACCOUNT.password, password);
  assert.equal(PUBLIC_DEMO_ACCOUNT.email, "mina.kim.demo@cosnap.staging");
  const form = new FormData();
  Object.entries(PUBLIC_DEMO_ACCOUNT).forEach(([key, value]) => form.set(key, value));
  assert.equal(validateAuthForm(form, "login").errorKey, null);
});

test("demo instructions identify the account as shared and distinguish filling from login", () => {
  assert.match(authTranslations.en["auth.demo.description"], /shared demo account/);
  assert.match(authTranslations.en["auth.demo.hint"], /fills the form only/);
  assert.match(authTranslations.ko["auth.demo.description"], /공유 데모 계정/);
});
