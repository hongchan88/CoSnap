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
  latitude?: number;
  longitude?: number;
  styles?: string[] | null;
  languages?: string[] | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
    focus_score?: number;
  };
  type: string;
}

// Get all flags for a specific user with pagination
export const getUserFlags = async (
  client: SupabaseClient,
  userId: string,
  page: number = 1,
  limit: number = 100 // Default to 100 to maintain backward compatibility if needed, or change to 10
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await client
      .from("flags")
      .select(
        `
        *,
        profiles!flags_user_id_profiles_profile_id_fk (
          username,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { success: true, flags: data as FlagWithDetails[], count };
  } catch (error) {
    console.error("Error fetching user flags:", error);
    return { success: false, flags: [], error, count: 0 };
  }
};

// Get all flags for a user (including inactive ones) - for profile history
export const getUserAllFlags = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select(
        `
        *,
        profiles!flags_user_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .eq("user_id", userId)

      .order("created_at", { ascending: false });
    console.log(data, "data in getUserAllFlags");
    if (error) {
      console.error("Error fetching user all flags:", error);
      return { success: false, error: error.message, flags: [] };
    }

    return { success: true, flags: data as FlagWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching user all flags:", error);
    return { success: false, error: "Failed to fetch flags", flags: [] };
  }
};

// Get all active flags for the global feed
export const getAllActiveFlags = async (
  client: SupabaseClient,
  limit: number = 20,
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  type?: string | null
) => {
  try {
    let query = client
      .from("flags")
      .select(
        `
        *,
        profiles!flags_user_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score
        )
      `
      )
      .eq("visibility_status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (bounds) {
      query = query
        .gte("latitude", bounds.minLat)
        .lte("latitude", bounds.maxLat)
        .gte("longitude", bounds.minLng)
        .lte("longitude", bounds.maxLng);
    }

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

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
export const getFlagById = async (client: SupabaseClient, flagId: string) => {
  try {
    const { data, error } = await client
      .from("flags")
      .select(
        `
        *,
        profiles!flags_user_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .eq("id", flagId)
      .single();

    if (error) {
      console.error("Error fetching flag by ID:", error);
      return { success: false, error: error.message, flag: null };
    }

    return {
      success: true,
      flag: data as FlagWithDetails & {
        username: string;
        avatar_url?: string;
        focus_score: number;
        focus_tier: string;
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching flag by ID:", error);
    return { success: false, error: "Failed to fetch flag", flag: null };
  }
};

// Get expired flags to update their status
export const getExpiredFlags = async (client: SupabaseClient) => {
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
    return {
      success: false,
      error: "Failed to fetch expired flags",
      flags: [],
    };
  }
};

// --- Matches ---

export interface MatchWithDetails {
  id: string;
  offer_id: string;
  user_a_id: string;
  user_b_id: string;
  flag_id: string;
  scheduled_at: string | null;
  location_hint: string | null;
  verify_status: "unverified" | "geo_verified" | "photo_verified" | "both";
  status: "scheduled" | "completed" | "no_show" | "cancelled";
  focus_reward_applied: boolean;
  credit_reward_applied: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  flag?: {
    city: string;
    country: string;
    start_date: string;
    end_date: string;
  };
  partner?: {
    username: string;
    avatar_url: string | null;
    focus_score: number;
    focus_tier: string;
  };
}

export const getUserMatches = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    // We need to fetch matches where user is either A or B
    // Supabase doesn't support complex OR conditions with joins easily in one go if we want to join different profiles based on who is who.
    // However, we can fetch all matches and then process them or use a more complex query.
    // For simplicity, let's fetch matches and then fetch related data or use Supabase's deep nesting if possible.
    // A better approach for "partner" info is to fetch it on the client or use a view, but here we will try to fetch enough info.

    const { data, error } = await client
      .from("matches")
      .select(
        `
        *,
        flag:flags!matches_flag_id_flags_id_fk (
          city,
          country,
          start_date,
          end_date
        ),
        user_a:profiles!matches_user_a_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        ),
        user_b:profiles!matches_user_b_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user matches:", error);
      return { success: false, error: error.message, matches: [] };
    }

    // Process data to unify "partner" info
    const matches = data.map((match: any) => {
      const isUserA = match.user_a_id === userId;
      const partner = isUserA ? match.user_b : match.user_a;
      return {
        ...match,
        partner,
      };
    });

    return { success: true, matches: matches as MatchWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching user matches:", error);
    return { success: false, error: "Failed to fetch matches", matches: [] };
  }
};

// --- Offers ---

export interface OfferWithDetails {
  id: string;
  sender_id: string;
  receiver_id: string;
  flag_id: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  sent_at: string;
  respond_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  flag?: {
    city: string;
    country: string;
    start_date: string;
    end_date: string;
  };
  sender?: {
    username: string;
    avatar_url: string | null;
    focus_score: number;
    focus_tier: string;
  };
  receiver?: {
    username: string;
    avatar_url: string | null;
  };
}

export const getUserOffers = async (client: SupabaseClient, userId: string) => {
  try {
    // Sent offers
    const { data: sentData, error: sentError } = await client
      .from("offers")
      .select(
        `
        *,
        flag:flags!offers_flag_id_flags_id_fk (
          id,
          user_id,
          city,
          country,
          start_date,
          end_date,
          note,
          visibility_status,
          latitude,
          longitude
        ),
        receiver:profiles!offers_receiver_id_profiles_profile_id_fk (
          username,
          avatar_url
        )
      `
      )
      .eq("sender_id", userId)
      .order("sent_at", { ascending: false });

    if (sentError) throw sentError;

    // Received offers
    const { data: receivedData, error: receivedError } = await client
      .from("offers")
      .select(
        `
        *,
        flag:flags!offers_flag_id_flags_id_fk (
          city,
          country,
          start_date,
          end_date
        ),
        sender:profiles!offers_sender_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .eq("receiver_id", userId)
      .order("sent_at", { ascending: false });

    if (receivedError) throw receivedError;

    return {
      success: true,
      sent: sentData as OfferWithDetails[],
      received: receivedData as OfferWithDetails[],
    };
  } catch (error) {
    console.error("Unexpected error fetching user offers:", error);
    return {
      success: false,
      error: "Failed to fetch offers",
      sent: [],
      received: [],
    };
  }
};

export const getOffersByFlag = async (
  client: SupabaseClient,
  flagId: string
) => {
  try {
    const { data, error } = await client
      .from("offers")
      .select(
        `
        *,
        sender:profiles!offers_sender_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .eq("flag_id", flagId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Error fetching offers by flag:", error);
      return { success: false, error: error.message, offers: [] };
    }

    return { success: true, offers: data as OfferWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching offers by flag:", error);
    return { success: false, error: "Failed to fetch offers", offers: [] };
  }
};

export const getOfferCountByFlag = async (
  client: SupabaseClient,
  flagId: string
) => {
  try {
    const { count, error } = await client
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("flag_id", flagId)
      .eq("status", "pending"); // Usually we only care about pending offers count for the badge

    if (error) {
      console.error("Error fetching offer count:", error);
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Unexpected error fetching offer count:", error);
    return { success: false, error: "Failed to fetch offer count", count: 0 };
  }
};

// --- Profile ---

export interface ProfileWithStats {
  profile_id: string;
  username: string;
  role: "free" | "premium" | "admin";
  focus_score: number;
  focus_tier: "Blurry" | "Focusing" | "Clear" | "Crystal";
  cocredit_balance: number;
  camera_gear: string | null;
  styles: string[] | null;
  languages: string[] | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const getUserProfile = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, error: error.message, profile: null };
    }

    return { success: true, profile: data as ProfileWithStats };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return { success: false, error: "Failed to fetch profile", profile: null };
  }
};

// --- Posts ---

export interface PostWithDetails {
  id: string;
  user_id: string;
  type: "help" | "emergency" | "free" | "meet" | "photo" | "offer";
  title: string;
  description: string;
  price?: number;
  currency?: string;
  latitude: number;
  longitude: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: {
    username: string;
    avatar_url: string | null;
    focus_score: number;
    focus_tier: string;
  };
}

export const getAllActivePosts = async (
  client: SupabaseClient,
  limit: number = 20,
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
) => {
  try {
    let query = client
      .from("posts")
      .select(
        `
        *,
        profiles!posts_user_id_profiles_profile_id_fk (
          username,
          avatar_url,
          focus_score,
          focus_tier
        )
      `
      )
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (bounds) {
      query = query
        .gte("latitude", bounds.minLat)
        .lte("latitude", bounds.maxLat)
        .gte("longitude", bounds.minLng)
        .lte("longitude", bounds.maxLng);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching active posts:", error);
      return { success: false, error: error.message, posts: [] };
    }

    return { success: true, posts: data as PostWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching active posts:", error);
    return { success: false, error: "Failed to fetch active posts", posts: [] };
  }
};

export const getUserPosts = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      return { success: false, error: error.message, posts: [] };
    }

    return { success: true, posts: data as PostWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching user posts:", error);
    return { success: false, error: "Failed to fetch user posts", posts: [] };
  }
};

// --- Conversations ---

export interface ConversationWithDetails {
  id: string;
  user_a_id: string;
  user_b_id: string;
  post_id?: string;
  offer_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  partner?: {
    username: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export const getUserConversations = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("conversations")
      .select(
        `
        *,
        user_a:profiles!conversations_user_a_id_profiles_profile_id_fk (
          username,
          avatar_url
        ),
        user_b:profiles!conversations_user_b_id_profiles_profile_id_fk (
          username,
          avatar_url
        ),
        messages (
          content,
          created_at,
          sender_id
        )
      `
      )
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user conversations:", error);
      return { success: false, error: error.message, conversations: [] };
    }

    // Process data to unify "partner" info and get last message
    const conversations = data.map((conv: any) => {
      const isUserA = conv.user_a_id === userId;
      const partner = isUserA ? conv.user_b : conv.user_a;
      
      // Sort messages to get the last one
      const sortedMessages = conv.messages?.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const last_message = sortedMessages?.[0];

      return {
        ...conv,
        partner,
        last_message,
      };
    });

    return { success: true, conversations: conversations as ConversationWithDetails[] };
  } catch (error) {
    console.error("Unexpected error fetching user conversations:", error);
    return { success: false, error: "Failed to fetch conversations", conversations: [] };
  }
};


// --- Stats & Search ---

export const getTopProfiles = async (client: SupabaseClient, limit: number = 3) => {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .order("focus_score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top profiles:", error);
      return { success: false, error: error.message, profiles: [] };
    }

    return { success: true, profiles: data as ProfileWithStats[] };
  } catch (error) {
    console.error("Unexpected error fetching top profiles:", error);
    return { success: false, error: "Failed to fetch top profiles", profiles: [] };
  }
};

export const getCommunityStats = async (client: SupabaseClient) => {
  try {
    // Parallel fetch for counts
    const [flagsRes, profilesRes, matchesRes] = await Promise.all([
      client.from("flags").select("*", { count: "exact", head: true }).eq("visibility_status", "active"),
      client.from("profiles").select("*", { count: "exact", head: true }),
      client.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed")
    ]);

    // For average focus score, we'll just take a simple average of the top 50 users to avoid scanning the whole table
    // or just valid profiles. For now, let's keep it simple and just use 0 or a sample.
    // Let's fetch the average of non-zero focus scores if possible, strictly limiting to 100 for perf.
    const { data: scores } = await client
      .from("profiles")
      .select("focus_score")
      .gt("focus_score", 0)
      .limit(100);
    
    let avgScore = 0;
    if (scores && scores.length > 0) {
      const sum = scores.reduce((acc, curr) => acc + (curr.focus_score || 0), 0);
      avgScore = Math.round((sum / scores.length) * 10) / 10;
    }

    return {
      success: true,
      stats: {
        totalActiveFlags: flagsRes.count || 0,
        totalProfiles: profilesRes.count || 0,
        averageFocusScore: avgScore,
        totalCoSnaps: matchesRes.count || 0,
      }
    };
  } catch (error) {
    console.error("Unexpected error fetching stats:", error);
    return { 
      success: false, 
      error: "Failed to fetch stats", 
      stats: {
        totalActiveFlags: 0,
        totalProfiles: 0,
        averageFocusScore: 0,
        totalCoSnaps: 0,
      } 
    };
  }
};
