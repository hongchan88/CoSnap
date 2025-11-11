import { createSupabaseClient } from "../lib/supabase";

// On-demand authentication functions
export async function signUp(
  email: string,
  password: string,
  username: string
) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      },
    });

    if (error) {
      return { error };
    }

    // 프로필 생성
    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        username,
        role: "free",
        focus_score: 0,
        focus_tier: "Blurry",
        cocredit_balance: 0,
        styles: [],
        languages: [],
        is_verified: false,
      });
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  } catch (error) {
    return { error };
  }
}

export async function signOut() {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createSupabaseClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log(error, "error");
      return { user: null, error };
    }

    return { user: session?.user ?? null, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return { profile: null, error };
    }

    return { profile: data ?? null, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}
