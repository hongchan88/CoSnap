import type { SupabaseClient } from "@supabase/supabase-js";

// Types for flag operations
export interface CreateFlagInput {
  user_id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  note?: string;
  styles?: string[];
  languages?: string[];
}

export interface UpdateFlagInput {
  city?: string;
  country?: string;
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
        start_date: flagData.startDate,
        end_date: flagData.endDate,
        note: flagData.note || null,
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
    if (flagData.startDate) updateData.start_date = flagData.startDate;
    if (flagData.endDate) updateData.end_date = flagData.endDate;
    if (flagData.note !== undefined) updateData.note = flagData.note;

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
