import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("logout", "routes/logout.tsx"),
  route("flags", "routes/flags.tsx"),
  route("explore", "routes/explore.tsx"),
  route("inbox", "routes/inbox.tsx"),
  route("matches", "routes/matches.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("email-preview", "routes/email-preview.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("api/notifications", "routes/api.notifications.ts"),
] satisfies RouteConfig;
