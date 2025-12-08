import { createClient } from "@supabase/supabase-js";
import {
  createServerClient,
  createBrowserClient,
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

// Supabase 클라이언트를 안전하게 생성하는 함수 (SSR & CSR 호환)
export function createSupabaseClient(request?: Request) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
    );
  }

  // 클라이언트 사이드에서는 간단한 클라이언트 생성
  if (typeof window !== "undefined" || !request) {
    // Browser environment or no request provided
    const client = createClient(supabaseUrl, supabaseAnonKey);
    return { client };
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

// Client-side helper to get authenticated client for browser usage
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") return null;

  // Try Vite env vars first (standard for client-side)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return createBrowserClient(envUrl, envKey);
  }
  
  // Fallback to window.ENV if injected
  // @ts-ignore
  const env = window.ENV;
  
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    console.error("Supabase env vars missing in browser environment");
    return null;
  }

  return createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// Avatar upload functions
export async function uploadAvatar(
  client: any,
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate unique filename
    console.log("uploadAvatar called with file:", file);
    if (!file || typeof file.name !== "string") {
      console.error("Invalid file object passed to uploadAvatar:", file);
      return { success: false, error: "유효하지 않은 파일입니다." };
    }
    if (file.size >= 2000000) {
      return {
        success: false,
        error: "이미지 파일 크기는 2MB 미만이어야 합니다.",
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await client.storage
      .from("avatars")
      .upload(userId, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return { success: false, error: "이미지 업로드에 실패했습니다." };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from("avatars")
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      return { success: false, error: "이미지 URL을 가져오는데 실패했습니다." };
    }
    console.log(urlData, "data url");
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Unexpected error uploading avatar:", error);
    return { success: false, error: "이미지 업로드 중 오류가 발생했습니다." };
  }
}

export async function deleteAvatar(
  client: any,
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts.slice(-2).join("/"); // 'avatars/filename.ext'

    // Delete from Supabase Storage
    const { error } = await client.storage.from("avatars").remove([filePath]);

    if (error) {
      console.error("Error deleting avatar:", error);
      return { success: false, error: "이미지 삭제에 실패했습니다." };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting avatar:", error);
    return { success: false, error: "이미지 삭제 중 오류가 발생했습니다." };
  }
}
