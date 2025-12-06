import { createSupabaseClient } from "~/lib/supabase";
import { getUserAllFlags } from "~/users/queries";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = params.userId;

  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // Fetch user profile
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { success: false, error: "Profile not found" };
    }

    // Fetch user's flag history
    const { success, flags, error: flagsError } = await getUserAllFlags(client, userId);

    if (!success || flagsError) {
      console.error("Error fetching user flags:", flagsError);
      // Still return profile even if flags fail
      return {
        success: true,
        profile: {
          username: profile?.username || "Unknown User",
          avatar_url: profile?.avatar_url,
          focus_score: profile?.focus_score || 0,
          focus_tier: profile?.focus_tier || "Blurry",
          camera_gear: profile?.camera_gear,
          languages: profile?.languages,
          bio: profile?.bio,
          is_verified: profile?.is_verified || false,
          userFlags: [],
        },
      };
    }

    return {
      success: true,
      profile: {
        username: profile?.username || "Unknown User",
        avatar_url: profile?.avatar_url,
        focus_score: profile?.focus_score || 0,
        focus_tier: profile?.focus_tier || "Blurry",
        camera_gear: profile?.camera_gear,
        languages: profile?.languages,
        bio: profile?.bio,
        is_verified: profile?.is_verified || false,
        userFlags: flags || [],
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return { success: false, error: "Internal server error" };
  }
}
