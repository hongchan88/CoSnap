import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("flags", "routes/flags.tsx"),
  route("offers", "routes/offers.tsx"),
  route("matches", "routes/matches.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
] satisfies RouteConfig;
