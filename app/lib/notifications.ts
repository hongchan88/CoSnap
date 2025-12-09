import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateNotificationInput {
  recipientId: string;
  senderId?: string;
  type:
    | "offer_received"
    | "offer_accepted"
    | "offer_declined"
    | "match_scheduled"
    | "message_received"
    | "system";
  referenceId?: string;
  referenceType?: "offer" | "match" | "conversation";
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

export const markMessagesAsRead = async (
  client: SupabaseClient,
  userId: string,
  senderId: string,
  conversationId: string
) => {
  console.log(`[markMessagesAsRead] START: user=${userId}, sender=${senderId}, conv=${conversationId}`);
  
  try {
    // 1. Mark 'message_received' notifications from this sender as read
    const { data: notifData, error: notifError, count: notifCount } = await client
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("sender_id", senderId)
      .eq("type", "message_received")
      .eq("is_read", false)
      .select();

    if (notifError) {
      console.error("[markMessagesAsRead] FAILED to update notifications:", notifError.message);
    } else {
      console.log(`[markMessagesAsRead] Updated ${notifData?.length || 0} notifications`);
    }

    // 2. Mark actual messages in the conversation as read
    const { data: msgData, error: msgError } = await client
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender_id", senderId)
      .eq("is_read", false)
      .select();

    if (msgError) {
      console.error("[markMessagesAsRead] FAILED to update messages:", msgError.message, msgError.code);
    } else {
      console.log(`[markMessagesAsRead] Updated ${msgData?.length || 0} messages to is_read=true`);
    }

    console.log("[markMessagesAsRead] END");
    return { success: !notifError && !msgError };
  } catch (error) {
    console.error(`[markMessagesAsRead] EXCEPTION: ${error instanceof Error ? error.message : error}`);
    return { success: false, error: "Operation failed" };
  }
};
