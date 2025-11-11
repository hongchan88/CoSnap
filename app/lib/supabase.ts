import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트를 안전하게 생성하는 함수 (CSR용)
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  });
}

// 서버사이트용 Supabase 클라이언트 (SSR/OAuth 콜백용)
let serverSupabase: ReturnType<typeof createSupabaseClient> | null = null;

export function getServerSupabase() {
  if (!serverSupabase) {
    // Node.js 환경 변수 (서버사이트)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing server-side Supabase environment variables. Please check your .env file.'
      );
    }

    serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
    });
  }

  return serverSupabase;
}
