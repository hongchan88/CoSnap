import { redirect } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

// Auth query
export const getLoggedInUserId = async (client: SupabaseClient) => {
  const { data, error } = await client.auth.getUser();
  console.log(data, "data in getLoggedInUserId");
  console.log(error, "error in getLoggedInUserId");
  if (error || data.user === null) {
    throw redirect("/login");
  }
  return data.user.id;
};

// Flag queries
export interface FlagWithDetails {
  id: string;
  user_id: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  note?: string;
  visibility_status: "active" | "hidden" | "expired";
  source_policy_type: "free" | "premium";
  exposure_policy: "default" | "premium_pinned";
  cutoff_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar_url?: string;
}

// Get all flags for a specific user
export const getUserFlags = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select(`
        *,
        profiles!inner (
          username,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user flags:", error);
      return { success: false, error: error.message, flags: [] };
    }

    return { success: true, flags: data as FlagWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching user flags:", error);
    return { success: false, error: "Failed to fetch flags", flags: [] };
  }
};

// Get all active flags for the global feed
export const getAllActiveFlags = async (
  client: SupabaseClient,
  limit: number = 20
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select(`
        *,
        profiles!inner (
          username,
          avatar_url
        )
      `)
      .eq("visibility_status", "active")
      .gte("end_date", new Date().toISOString()) // Only future or current trips
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching active flags:", error);
      return { success: false, error: error.message, flags: [] };
    }

    return { success: true, flags: data as FlagWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching active flags:", error);
    return { success: false, error: "Failed to fetch active flags", flags: [] };
  }
};

// Get a single flag by ID
export const getFlagById = async (
  client: SupabaseClient,
  flagId: string
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select(`
        *,
        profiles!inner (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `)
      .eq("id", flagId)
      .single();

    if (error) {
      console.error("Error fetching flag by ID:", error);
      return { success: false, error: error.message, flag: null };
    }

    return { success: true, flag: data as FlagWithDetails & {
      username: string;
      avatar_url?: string;
      focus_score: number;
      focus_tier: string;
    } };
  } catch (error) {
    console.error("Unexpected error fetching flag by ID:", error);
    return { success: false, error: "Failed to fetch flag", flag: null };
  }
};

// Get expired flags to update their status
export const getExpiredFlags = async (
  client: SupabaseClient
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select("id")
      .eq("visibility_status", "active")
      .lt("end_date", new Date().toISOString());

    if (error) {
      console.error("Error fetching expired flags:", error);
      return { success: false, error: error.message, flags: [] };
    }

    return { success: true, flags: data };
  } catch (error) {
    console.error("Unexpected error fetching expired flags:", error);
    return { success: false, error: "Failed to fetch expired flags", flags: [] };
  }
};
