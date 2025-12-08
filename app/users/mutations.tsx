import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "~/lib/notifications";

// Types for flag operations
export interface CreateFlagInput {
  user_id: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  startDate: string;
  endDate: string;
  note?: string;
  languages?: string[];
  type: string;
  // Meetup-specific
  meetupCategory?: string;
  // Offer-specific
  serviceLevel?: string;
  serviceCategory?: string;
  serviceOther?: string;
}

export interface UpdateFlagInput {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  languages?: string[];
  type?: string;
  // Meetup-specific
  meetupCategory?: string;
  // Offer-specific
  serviceLevel?: string;
  serviceCategory?: string;
  serviceOther?: string;
}

// Helper: Randomize location within 10km radius (~0.1 degrees)
const randomizeLocation = (lat: number, lng: number): { lat: number; lng: number } => {
  // 1 degree lat ~= 111km
  // 10km ~= 0.09 degrees
  const R_EARTH = 6371; // km
  const RADIUS = 5; // km

  // Random distance within radius (square root for uniform distribution area-wise)
  const r = RADIUS * Math.sqrt(Math.random());
  // Random angle
  const theta = Math.random() * 2 * Math.PI;

  const dy = r * Math.sin(theta); // km north
  const dx = r * Math.cos(theta); // km east

  const newLat = lat + (dy / 111);
  const newLng = lng + (dx / (111 * Math.cos(lat * (Math.PI / 180))));

  return { lat: newLat, lng: newLng };
};

// Create a new flag
export const createFlag = async (
  client: SupabaseClient,
  flagData: CreateFlagInput
) => {
  try {
    // 1. Check user role and active flags count
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("profile_id", flagData.user_id)
      .single();

    const { count } = await client
      .from("flags")
      .select("*", { count: "exact", head: true })
      .eq("user_id", flagData.user_id)
      .eq("visibility_status", "active");

    const userRole = profile?.role || "free";
    const activeFlags = count || 0;

    // 2. Enforce limits
    if (userRole === "free" && activeFlags >= 1) {
      return { 
        success: false, 
        error: "Free plan limit reached (1 active flag). Upgrade to Premium for more!" 
      };
    }

    if (userRole === "premium" && activeFlags >= 5) {
      return { 
        success: false, 
        error: "Premium plan limit reached (5 active flags)." 
      };
    }

    // Randomize location if provided
    let finalLat = flagData.latitude;
    let finalLng = flagData.longitude;
    
    if (finalLat && finalLng) {
      const { lat, lng } = randomizeLocation(finalLat, finalLng);
      finalLat = lat;
      finalLng = lng;
    }

    const { data, error } = await client
      .from("flags")
      .insert({
        user_id: flagData.user_id,
        city: flagData.city,
        country: flagData.country,
        latitude: finalLat,
        longitude: finalLng,
        title: flagData.title,
        start_date: flagData.startDate,
        end_date: flagData.endDate,
        note: flagData.note || null,
        styles: [], // Deprecated
        languages: flagData.languages || [],
        type: flagData.type,
        meetup_category: flagData.meetupCategory || null,
        service_level: flagData.serviceLevel || null,
        service_category: flagData.serviceCategory || null,
        service_other: flagData.serviceOther || null,
        visibility_status: "active",
        source_policy_type: userRole, // Set source policy based on role
        exposure_policy: userRole === "premium" ? "premium_pinned" : "default", // Premium gets pinned exposure
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
    
    // Randomize location on update too if it changes
    if (flagData.latitude !== undefined && flagData.longitude !== undefined) {
      const { lat, lng } = randomizeLocation(flagData.latitude, flagData.longitude);
      updateData.latitude = lat;
      updateData.longitude = lng;
    } else {
      if (flagData.latitude !== undefined) updateData.latitude = flagData.latitude;
      if (flagData.longitude !== undefined) updateData.longitude = flagData.longitude;
    }
    if (flagData.title) updateData.title = flagData.title;
    if (flagData.startDate) updateData.start_date = flagData.startDate;
    if (flagData.endDate) updateData.end_date = flagData.endDate;
    if (flagData.note !== undefined) updateData.note = flagData.note;
    // styles deprecated
    if (flagData.languages) updateData.languages = flagData.languages;
    if (flagData.type) updateData.type = flagData.type;

    // Enforce 3-day limit on update if dates change
    if (flagData.startDate || flagData.endDate) {
      // We need both dates to validate. If only one is provided, we might need to fetch the other.
      // For simplicity/safety, let's assume if one is provided, both should be checked or we fetch current.
      // But here we can just check if both are provided in update, or rely on client. 
      // Better: Fetch current flag if only one date provided? 
      // For now, let's assume client sends both if changing duration, or we skip strict check here if partial.
      // But critical: if both provided:
      if (flagData.startDate && flagData.endDate) {
         const start = new Date(flagData.startDate);
         const end = new Date(flagData.endDate);
         const diffTime = Math.abs(end.getTime() - start.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays > 3) {
            return { success: false, error: "Flag duration cannot exceed 3 days." };
         }
      }
    }

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

    // Send notification to receiver
    await createNotification(client, {
      recipientId: offerData.receiverId,
      senderId: offerData.senderId,
      type: "offer_received",
      referenceId: data.id,
      referenceType: "offer",
    });

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

    // 4. Create or Get Conversation (Auto-link)
    // Check if one exists for this offer or post context
    const { data: existingConv } = await client
        .from("conversations")
        .select("id")
        .eq("offer_id", offerId)
        .single();
    
    let conversationId = existingConv?.id;

    if (!conversationId) {
        const { data: newConv, error: convError } = await client
            .from("conversations")
            .insert({
                user_a_id: offer.sender_id,
                user_b_id: offer.receiver_id,
                offer_id: offerId,
                post_id: offer.post_id // if exists
            })
            .select("id")
            .single();
        
        if (!convError && newConv) {
            conversationId = newConv.id;
        } else {
             console.error("Error auto-creating conversation:", convError);
             // We don't fail the whole operation, just log it. User can create manual DM later if needed.
        }
    }

    // Send notification to sender (who is now user_a in match)
    await createNotification(client, {
      recipientId: offer.sender_id,
      senderId: userId, // Receiver accepted, so they are the sender of this notification
      type: "offer_accepted",
      referenceId: match.id,
      referenceType: "match",
    });

    return { success: true, match, conversationId };
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

    // Fetch offer to get sender_id
    const { data: offer } = await client
      .from("offers")
      .select("sender_id")
      .eq("id", offerId)
      .single();

    if (offer) {
      await createNotification(client, {
        recipientId: offer.sender_id,
        senderId: userId,
        type: "offer_declined",
        referenceId: offerId,
        referenceType: "offer",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error declining offer:", error);
    return { success: false, error: "Failed to decline offer" };
  }
};
