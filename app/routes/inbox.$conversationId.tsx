import { useRef } from "react";
import { useLoaderData, useFetcher, Link } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getConversationDetails, getLoggedInUserId } from "~/users/queries";
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
      if (!content) return { success: false, error: "Content required" };

      const { error } = await client
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
        });

      if (error) {
        return { success: false, error: error.message };
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

