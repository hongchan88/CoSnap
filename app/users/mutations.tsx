import type { SupabaseClient } from "@supabase/supabase-js";

// Types for flag operations
export interface CreateFlagInput {
  user_id: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  startDate: string;
  endDate: string;
  note?: string;
  styles?: string[];
  languages?: string[];
}

export interface UpdateFlagInput {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  styles?: string[];
  languages?: string[];
}
// Create a new flag
export const createFlag = async (
  client: SupabaseClient,
  flagData: CreateFlagInput
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .insert({
        user_id: flagData.user_id,
        city: flagData.city,
        country: flagData.country,
        latitude: flagData.latitude,
        longitude: flagData.longitude,
        start_date: flagData.startDate,
        end_date: flagData.endDate,
        note: flagData.note || null,
        styles: flagData.styles || [],
        languages: flagData.languages || [],
        visibility_status: "active",
        source_policy_type: "free", // Default to free, can be updated based on user role
        exposure_policy: "default",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flag:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating flag:", error);
    return { success: false, error: "Failed to create flag" };
  }
};

// Update an existing flag
export const updateFlag = async (
  client: SupabaseClient,
  flagId: string,
  flagData: UpdateFlagInput
) => {
  try {
    const updateData: any = {};

    if (flagData.city) updateData.city = flagData.city;
    if (flagData.country) updateData.country = flagData.country;
    if (flagData.latitude !== undefined) updateData.latitude = flagData.latitude;
    if (flagData.longitude !== undefined) updateData.longitude = flagData.longitude;
    if (flagData.startDate) updateData.start_date = flagData.startDate;
    if (flagData.endDate) updateData.end_date = flagData.endDate;
    if (flagData.note !== undefined) updateData.note = flagData.note;
    if (flagData.styles) updateData.styles = flagData.styles;
    if (flagData.languages) updateData.languages = flagData.languages;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from("flags")
      .update(updateData)
      .eq("id", flagId)
      .select()
      .single();

    if (error) {
      console.error("Error updating flag:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating flag:", error);
    return { success: false, error: "Failed to update flag" };
  }
};

// Delete a flag
export const deleteFlag = async (
  client: SupabaseClient,
  flagId: string,
  userId: string
) => {
  try {
    const { error } = await client
      .from("flags")
      .delete()
      .eq("id", flagId)
      .eq("user_id", userId); // Ensure user can only delete their own flags

    if (error) {
      console.error("Error deleting flag:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting flag:", error);
    return { success: false, error: "Failed to delete flag" };
  }
};

// Toggle flag visibility status
export const toggleFlagVisibility = async (
  client: SupabaseClient,
  flagId: string,
  userId: string
) => {
  try {
    // First get current status
    const { data: currentFlag, error: fetchError } = await client
      .from("flags")
      .select("visibility_status")
      .eq("id", flagId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const newStatus =
      currentFlag.visibility_status === "active" ? "hidden" : "active";

    const { data, error } = await client
      .from("flags")
      .update({
        visibility_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flagId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling flag visibility:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error toggling flag visibility:", error);
    return { success: false, error: "Failed to toggle flag visibility" };
  }
};

// --- Profile Mutations ---

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  cameraGear?: string;
  styles?: string[];
  languages?: string[];
  avatarUrl?: string;
  location?: string; // Note: Schema doesn't have location, maybe store in bio or separate field if needed. For now assuming it's not in schema or mapped to something else.
  // Checking schema: profiles has camera_gear, styles, languages, bio. No location column.
  // We will ignore location for now or put it in bio if requested, but better to stick to schema.
}

export const updateUserProfile = async (
  client: SupabaseClient,
  userId: string,
  profileData: UpdateProfileInput
) => {
  try {
    const updateData: any = {};
    if (profileData.username) updateData.username = profileData.username;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileData.cameraGear !== undefined) updateData.camera_gear = profileData.cameraGear;
    if (profileData.styles) updateData.styles = profileData.styles;
    if (profileData.languages) updateData.languages = profileData.languages;
    if (profileData.avatarUrl !== undefined) updateData.avatar_url = profileData.avatarUrl;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from("profiles")
      .update(updateData)
      .eq("profile_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

// --- Offer Mutations ---

export interface CreateOfferInput {
  senderId: string;
  receiverId: string;
  flagId: string;
  message: string;
}

export const createOffer = async (
  client: SupabaseClient,
  offerData: CreateOfferInput
) => {
  try {
    // Validation
    if (offerData.senderId === offerData.receiverId) {
      return { success: false, error: "Cannot send offer to yourself" };
    }

    // Check if sender profile exists
    const { data: senderProfile } = await client
      .from("profiles")
      .select("profile_id")
      .eq("profile_id", offerData.senderId)
      .single();

    if (!senderProfile) {
      return { success: false, error: "error.profile.notFound" };
    }

    // Check if receiver profile exists
    const { data: receiverProfile } = await client
      .from("profiles")
      .select("profile_id")
      .eq("profile_id", offerData.receiverId)
      .single();

    if (!receiverProfile) {
      return { success: false, error: "error.profile.missing" };
    }

    const { data, error } = await client
      .from("offers")
      .insert({
        sender_id: offerData.senderId,
        receiver_id: offerData.receiverId,
        flag_id: offerData.flagId,
        message: offerData.message,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating offer:", error);
    return { success: false, error: "Failed to create offer" };
  }
};

export const updateOffer = async (
  client: SupabaseClient,
  offerId: string,
  message: string,
  userId: string // Sender ID
) => {
  try {
    const { data, error } = await client
      .from("offers")
      .update({ 
        message, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", offerId)
      .eq("sender_id", userId) // RLS should handle this, but extra safety
      .select()
      .single();

    if (error) {
      console.error("Error updating offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating offer:", error);
    return { success: false, error: "Failed to update offer" };
  }
};

export const cancelOffer = async (
  client: SupabaseClient,
  offerId: string,
  userId: string // Sender ID
) => {
  try {
    const { error } = await client
      .from("offers")
      .update({ 
        status: "cancelled", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", offerId)
      .eq("sender_id", userId);

    if (error) {
      console.error("Error cancelling offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error cancelling offer:", error);
    return { success: false, error: "Failed to cancel offer" };
  }
};

export const acceptOffer = async (
  client: SupabaseClient,
  offerId: string,
  userId: string // Receiver ID (current user)
) => {
  try {
    // 1. Verify offer exists and is for this user
    const { data: offer, error: fetchError } = await client
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .eq("receiver_id", userId)
      .single();

    if (fetchError || !offer) {
      return { success: false, error: "Offer not found or unauthorized" };
    }

    if (offer.status !== "pending") {
      return { success: false, error: "Offer is not pending" };
    }

    // 2. Update offer status
    const { error: updateError } = await client
      .from("offers")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", offerId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. Create match
    const { data: match, error: matchError } = await client
      .from("matches")
      .insert({
        offer_id: offerId,
        user_a_id: offer.sender_id,
        user_b_id: offer.receiver_id,
        flag_id: offer.flag_id,
        status: "scheduled",
      })
      .select()
      .single();

    if (matchError) {
      console.error("Error creating match:", matchError);
      // Rollback offer status if possible, or just return error (manual fix might be needed)
      return { success: false, error: "Failed to create match" };
    }

    return { success: true, match };
  } catch (error) {
    console.error("Unexpected error accepting offer:", error);
    return { success: false, error: "Failed to accept offer" };
  }
};

export const declineOffer = async (
  client: SupabaseClient,
  offerId: string,
  userId: string
) => {
  try {
    const { error } = await client
      .from("offers")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", offerId)
      .eq("receiver_id", userId);

    if (error) {
      console.error("Error declining offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error declining offer:", error);
    return { success: false, error: "Failed to decline offer" };
  }
};
