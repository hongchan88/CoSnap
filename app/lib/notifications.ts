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
    // Queries
    const notifQuery = client
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("sender_id", senderId)
      .eq("type", "message_received")
      .eq("is_read", false)
      .select();

    const msgQuery = client
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender_id", senderId)
      .eq("is_read", false)
      .select();

    // Timeout Promise (2000ms safety limit)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database operation timed out")), 2000)
    );

    // Race against timeout
    // Use Promise.all to run DB updates in parallel
    const [notifResult, msgResult] = await Promise.race([
      Promise.all([notifQuery, msgQuery]),
      timeoutPromise
    ]) as [any, any];

    // Handle results
    const { error: notifError, data: notifData } = notifResult;
    const { error: msgError, data: msgData } = msgResult;

    if (notifError) console.error("[markMessagesAsRead] Notifications update failed:", notifError.message);
    else console.log(`[markMessagesAsRead] Updated ${notifData?.length || 0} notifications`);

    if (msgError) console.error("[markMessagesAsRead] Messages update failed:", msgError.message);
    else console.log(`[markMessagesAsRead] Updated ${msgData?.length || 0} messages`);

    console.log("[markMessagesAsRead] END Success");
    return { success: !notifError && !msgError };

  } catch (error) {
    console.error(`[markMessagesAsRead] EXCEPTION: ${error instanceof Error ? error.message : error}`);
    // Return false but DO NOT THROW, so page loader continues loading
    return { success: false, error: "Operation timed out or failed" };
  }
};
