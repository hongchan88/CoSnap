import { useRef } from "react";
import { useLoaderData, useFetcher, Link } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getConversationDetails, getLoggedInUserId } from "~/users/queries";
import { createNotification, markMessagesAsRead } from "~/lib/notifications";
import type { Route } from "./+types/inbox.$conversationId";
import ChatWindow from "~/components/ChatWindow";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const conversationId = params.conversationId;

  if (!conversationId) {
    throw new Response("Conversation ID required", { status: 400 });
  }

  const result = await getConversationDetails(client, conversationId, userId);

  if (!result.success || !result.conversation) {
    throw new Response(result.error || "Conversation not found", { status: 404 });
  }

  // Mark pending notifications from this partner as read
  if (result.conversation) {
    const partnerId = result.conversation.user_a_id === userId 
      ? result.conversation.user_b_id 
      : result.conversation.user_a_id;
      
    if (partnerId) {
      await markMessagesAsRead(client, userId, partnerId, conversationId);
    }
  }

  return { conversation: result.conversation, messages: result.messages || [], userId, partner: result.partner };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const conversationId = params.conversationId;
  const formData = await request.formData();
  // Support both 'content' (from old form) and generic chat window usage
  const content = formData.get("content") as string;
  const intent = formData.get("intent"); // 'send_message'

  if (!conversationId) {
    return { success: false, error: "Conversation ID required" };
  }

  // If using shared ChatWindow, it sends intent=send_message
  if (intent === "send_message" || content) {
      console.log("[InboxAction] Attempting to send message:", { conversationId, userId, contentLength: content?.length });
      
      if (!content) {
        console.error("[InboxAction] Content is missing");
        return { success: false, error: "Content required" };
      }

      const { data: insertData, error } = await client
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
        })
        .select();

      if (error) {
        console.error("[InboxAction] Message insertion failed:", error);
        return { success: false, error: error.message };
      }
      console.log("[InboxAction] Message inserted successfully:", insertData);

      // --- SMART NOTE: Notification Logic ---
      console.log("[SmartNotif] Starting notification logic for conversationId:", conversationId);
      
      const { data: conversation, error: convError } = await client
        .from("conversations")
        .select("user_a_id, user_b_id")
        .eq("id", conversationId)
        .single();
      
      console.log("[SmartNotif] Conversation query result:", { conversation, convError });
      
      if (!conversation) {
        console.error("[SmartNotif] Could not find conversation - aborting notification");
      } else {
        const recipientId = conversation.user_a_id === userId ? conversation.user_b_id : conversation.user_a_id;
        console.log("[SmartNotif] Calculated recipientId:", recipientId, "(sender userId:", userId, ")");
        
        // Check for existing UNREAD message notification from this sender to this recipient
        const { data: existingNotif, error: checkError } = await client
          .from("notifications")
          .select("id")
          .eq("recipient_id", recipientId)
          .eq("sender_id", userId)
          .eq("type", "message_received")
          .eq("is_read", false)
          .single();

        console.log("[SmartNotif] Existing notification check:", { existingNotif, checkError });

        if (existingNotif) {
          console.log(`[SmartNotif] Updating existing notification ${existingNotif.id}`);
          // DEBOUNCE: Update timestamp of existing notification
          const { error: updateError } = await client
            .from("notifications")
            .update({ created_at: new Date().toISOString() })
            .eq("id", existingNotif.id);
          
          if (updateError) console.error("[SmartNotif] Error updating:", updateError);
          else console.log("[SmartNotif] Successfully updated notification timestamp");

        } else {
          console.log(`[SmartNotif] Creating new notification for recipient ${recipientId}`);
          // CREATE NEW: No unread notification exists
          const result = await createNotification(client, {
            recipientId,
            senderId: userId,
            type: "message_received",
            referenceId: conversationId,
            referenceType: "conversation", 
          });
          console.log("[SmartNotif] createNotification result:", result);
          if (!result.success) console.error("[SmartNotif] Error creating:", result.error);
        }
      }

      return { success: true };
  }

  return { success: false, error: "Invalid intent" };
}

export default function Conversation() {
  const { conversation, messages, userId, partner } = useLoaderData<typeof loader>();

  return (
    <div className="h-[calc(100vh-4rem)] bg-white p-4">
       <ChatWindow 
          conversation={conversation} 
          messages={messages} 
          userId={userId} 
          partner={partner}
          // Default actionUrl posts to current route, which is fine
        />
    </div>
  );
}

