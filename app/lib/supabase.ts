import { createClient } from "@supabase/supabase-js";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
  type CookieMethodsServer,
} from "@supabase/ssr";

// Simple cookie parsing function
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
}

// Supabase 클라이언트를 안전하게 생성하는 함수 (CSR용)
export function createSupabaseClient(request?: Request) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
    );
  }

  // 서버 사이드에서는 쿠키 처리
  const headers = new Headers();
  const cookies: CookieMethodsServer = {
    getAll() {
      const cookieHeader = request?.headers.get("Cookie") ?? "";
      const parsedCookies = parseCookieHeader(cookieHeader);
      // Convert to expected format: { name: string; value: string; }[]
      return parsedCookies.map(({ name, value }) => ({
        name,
        value: value ?? "",
      }));
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        headers.append(
          "Set-Cookie",
          serializeCookieHeader(name, value, options)
        );
      });
    },
  };
  const serversideClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies,
  });

  return { client: serversideClient, headers };
}
