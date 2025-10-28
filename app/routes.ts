import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("flags", "routes/flags.tsx"),
  route("offers", "routes/offers.tsx"),
  route("matches", "routes/matches.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
