import { useEffect, useRef } from "react";
import { useLoaderData, useFetcher, Form, Link } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId } from "~/users/queries";
import type { Route } from "./+types/inbox.$conversationId";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { client, headers } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const conversationId = params.conversationId;

  if (!conversationId) {
    throw new Response("Conversation ID required", { status: 400 });
  }

  // Fetch conversation details with partner info
  const { data: conversation, error: convError } = await client
    .from("conversations")
    .select(`
      *,
      user_a:profiles!conversations_user_a_id_profiles_profile_id_fk (
        username,
        avatar_url
      ),
      user_b:profiles!conversations_user_b_id_profiles_profile_id_fk (
        username,
        avatar_url
      ),
      offer:offers (
        id,
        status,
        price,
        currency
      ),
      post:posts (
        title,
        type
      )
    `)
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    throw new Response("Conversation not found", { status: 404 });
  }

  // Fetch messages
  const { data: messages, error: msgError } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    throw new Response("Failed to load messages", { status: 500 });
  }

  // Determine partner
  const isUserA = conversation.user_a_id === userId;
  const partner = isUserA ? conversation.user_b : conversation.user_a;

  return { conversation, messages, userId, partner };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { client, headers } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const conversationId = params.conversationId;
  const formData = await request.formData();
  const content = formData.get("content") as string;

  if (!content || !conversationId) {
    return { success: false, error: "Content and conversation ID required" };
  }

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

export default function Conversation() {
  const { conversation, messages, userId, partner } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (fetcher.state === "submitting" && formRef.current) {
      formRef.current.reset();
    }
  }, [fetcher.state]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <Link to="/profile" className="md:hidden">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={partner?.avatar_url || ""} />
          <AvatarFallback>{partner?.username?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{partner?.username}</h2>
          {conversation.post && (
            <p className="text-xs text-gray-500 truncate">
              Re: {conversation.post.title} ({conversation.post.type})
            </p>
          )}
        </div>
        {conversation.offer && (
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            conversation.offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            conversation.offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Offer: {conversation.offer.status}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className={`text-[10px] block mt-1 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <fetcher.Form method="post" className="flex gap-2" ref={formRef}>
          <Input
            name="content"
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={fetcher.state === "submitting"}>
            <Send className="w-4 h-4" />
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
