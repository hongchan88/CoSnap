import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("logout", "routes/logout.tsx"),
  route("flags", "routes/flags.tsx"),
  route("offers", "routes/offers.tsx"),
  route("matches", "routes/matches.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("email-preview", "routes/email-preview.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
] satisfies RouteConfig;
