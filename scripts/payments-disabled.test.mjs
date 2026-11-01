import assert from "node:assert/strict";
import test from "node:test";
import { loader } from "../app/routes/api.stripe.mock-success.ts";
import { action } from "../app/routes/api.stripe.checkout.ts";
import { createCheckoutSession } from "../app/lib/stripe.server.ts";

test("legacy mock callback never grants access, even with supplied user and plan", async () => {
  const response = await loader({ request: new Request("https://example.com/api/stripe/mock-success?userId=someone&planType=premium_yearly") });
  assert.equal(response.status, 410);
});

test("checkout fails closed until real payments are implemented", async () => {
  assert.equal((await action()).status, 503);
  await assert.rejects(createCheckoutSession("someone", "premium_monthly"), /not available/);
});
