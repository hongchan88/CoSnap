import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("logout", "routes/logout.tsx"),
  route("flags", "routes/flags.tsx"),
  route("explore", "routes/explore.tsx"),
  route("inbox/:conversationId", "routes/inbox.$conversationId.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("email-preview", "routes/email-preview.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("api/notifications", "routes/api.notifications.ts"),
  route("api/user-profile/:userId", "routes/api.user-profile.$userId.ts"),
  route("pricing", "routes/pricing.tsx"),
  route("api/stripe/checkout", "routes/api.stripe.checkout.ts"),
  route("api/stripe/mock-success", "routes/api.stripe.mock-success.ts"),
  route("api/stripe/downgrade", "routes/api.stripe.downgrade.ts"),
] satisfies RouteConfig;
