import { db, profiles } from "~/db/db";
import { eq } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.userId;
  if (!userId) return { success: false, error: "User ID is required" };

  try {
    const [profile] = await db
      .select({
        username: profiles.username,
        avatar_url: profiles.avatarUrl,
        focus_score: profiles.focusScore,
        focus_tier: profiles.focusTier,
        camera_gear: profiles.cameraGear,
        languages: profiles.languages,
        bio: profiles.bio,
        is_verified: profiles.isVerified,
      })
      .from(profiles)
      .where(eq(profiles.profile_id, userId))
      .limit(1);

    if (!profile) return { success: false, error: "Profile not found" };
    return { success: true, profile: { ...profile, userFlags: [] } };
  } catch (error) {
    console.error("Unexpected error fetching public profile:", error);
    return { success: false, error: "Internal server error" };
  }
}
