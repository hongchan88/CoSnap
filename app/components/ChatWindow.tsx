import { useRef, useEffect, useState } from "react";
import { useFetcher, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { getSupabaseBrowserClient } from "~/lib/supabase";

interface ChatWindowProps {
  conversation: any;
  messages: any[];
  userId: string;
  partner: any;
  onBack?: () => void;
  actionUrl?: string; // Optional URL to submit the form to (if different from current)
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white z-10">
        <div className="w-6 h-6 rounded bg-gray-200 animate-pulse md:hidden" />
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-6 bg-gray-50/50 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`h-12 w-[60%] bg-gray-200 rounded-2xl animate-pulse ${
                i % 2 === 0 ? 'rounded-br-none' : 'rounded-bl-none'
              }`} 
            />
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

export default function ChatWindow({ conversation, messages: initialMessages, userId, partner, onBack, actionUrl }: ChatWindowProps) {
  const fetcher = useFetcher();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [messages, setMessages] = useState(initialMessages);

  // Sync state with props if they change (e.g. switching conversations)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Reset form after submission
    if (fetcher.state === "submitting" && formRef.current) {
      formRef.current.reset();
    }
  }, [fetcher.state]);
  
  // Real-time subscription
  // Real-time subscription
  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
        console.error("Failed to initialize Supabase client. Check window.ENV or .env configuration.");
        return;
    }
    if (!conversation.id) {
        console.error("Missing conversation ID in ChatWindow props.");
        return;
    }

    const channel = client
      .channel(`conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload: any) => {
          const newMessage = payload.new;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [conversation.id]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white z-10">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-1 -ml-2">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        )}
        {!onBack && (
            <Link to="/profile?tab=messages" className="md:hidden">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
        )}
        
        <Avatar className="h-10 w-10 border border-gray-100">
          <AvatarImage src={partner?.avatar_url || ""} />
          <AvatarFallback>{partner?.username?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{partner?.username}</h2>
          {conversation.post && (
            <p className="text-xs text-gray-500 truncate">
              Re: {conversation.post.title} ({conversation.post.type})
            </p>
          )}
        </div>
        {conversation.offer && (
          <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            conversation.offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            conversation.offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Offer: {conversation.offer.status}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
        {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
                No messages yet. Say hello!
            </div>
        ) : messages.map((msg: any) => {
          const isMe = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <span className={`text-[10px] block mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <fetcher.Form method="post" action={actionUrl} className="flex gap-2" ref={formRef}>
          {/* If posting to main profile route, distinguish intent */}
          <input type="hidden" name="intent" value="send_message" />
          <input type="hidden" name="conversationId" value={conversation.id} />
          
          <Input
            name="content"
            placeholder="Type a message..."
            className="flex-1 focus-visible:ring-blue-500"
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700" disabled={fetcher.state === "submitting"}>
            <Send className="w-4 h-4" />
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
