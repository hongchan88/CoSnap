import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateNotificationInput {
  recipientId: string;
  senderId?: string;
  type:
    | "offer_received"
    | "offer_accepted"
    | "offer_declined"
    | "match_scheduled"
    | "system";
  referenceId?: string;
  referenceType?: "offer" | "match";
}

export const createNotification = async (
  client: SupabaseClient,
  data: CreateNotificationInput
) => {
  try {
    const { error } = await client.from("notifications").insert({
      recipient_id: data.recipientId,
      sender_id: data.senderId,
      type: data.type,
      reference_id: data.referenceId,
      reference_type: data.referenceType,
      is_read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
};

export const getNotifications = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await client
      .from("notifications")
      .select(`
        *,
        sender:profiles!notifications_sender_id_profiles_profile_id_fk (
          username,
          avatar_url
        )
      `)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message, notifications: [] };
    }

    return { success: true, notifications: data };
  } catch (error) {
    console.error("Unexpected error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications", notifications: [] };
  }
};

export const markAsRead = async (
  client: SupabaseClient,
  notificationId: string
) => {
  try {
    const { error } = await client
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
};

export const markAllAsRead = async (
  client: SupabaseClient,
  userId: string
) => {
  try {
    const { error } = await client
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
};
