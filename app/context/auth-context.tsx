import { createSupabaseClient } from "../lib/supabase";

// On-demand authentication functions
export async function signUp(
  email: string,
  password: string,
  username: string
) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.client.auth.signUp({
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

    // 프로필 생성 (ensure session is established)
    if (data.user) {
      // Wait for session to be properly established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify current user session
      const { data: { session }, error: sessionError } = await supabase.client.auth.getSession();
      if (sessionError || !session?.user) {
        console.error("Session not established after signup");
        return { error: { message: "Session establishment failed" } };
      }

      console.log("Session established, inserting profile for:", session.user.id);
      const { error: profileError } = await supabase.client.from("profiles").insert({
        profile_id: data.user.id,
        username,
        role: "free",
        focus_score: 0,
        focus_tier: "Blurry",
        cocredit_balance: 0,
        styles: [],
        languages: [],
        is_verified: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        return { error: profileError };
      }
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.client.auth.signInWithPassword({
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

    const { data, error } = await supabase.client.auth.signInWithOAuth({
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

    const { error } = await supabase.client.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.client.auth.getUser();

    if (error) {
      console.log(error, "error");
      return { user: null, error };
    }

    return { user: user ?? null, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.client
      .from("profiles")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return { profile: null, error };
    }

    return { profile: data ?? null, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}
