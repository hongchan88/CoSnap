import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useFetcher, Link, useNavigate } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { createBrowserClient } from "@supabase/ssr";

interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  reference_id?: string;
  reference_type?: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const navigate = useNavigate();

  // Supabase client for realtime
  const [supabase] = useState(() => 
    createBrowserClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    )
  );

  // Load notifications
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/notifications");
    }
  }, []);

  // Update state when fetcher loads data
  useEffect(() => {
    if (fetcher.data && fetcher.data.success) {
      const notifs = fetcher.data.notifications as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    }
  }, [fetcher.data]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          // Refresh notifications when new one arrives
          fetcher.load("/api/notifications");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetcher]);

  const handleMarkAllRead = () => {
    fetcher.submit(
      { intent: "mark_all_read" },
      { method: "post", action: "/api/notifications" }
    );
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    
    if (!notification.is_read) {
      fetcher.submit(
        { intent: "mark_read", notificationId: notification.id },
        { method: "post", action: "/api/notifications" }
      );
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? ({ ...n, is_read: true }) : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate based on type
    if (notification.type.includes("offer")) {
      if (notification.type === "offer_received") {
        navigate("/profile?tab=received");
      } else if (notification.type === "offer_accepted") {
        navigate("/profile?tab=sent");
      } else {
        navigate("/profile?tab=messages");
      }
    } else if (notification.type.includes("match")) {
      navigate("/profile?tab=messages");
    } else {
      // Default fallback
      navigate("/profile?tab=messages");
    }
  };

  const getNotificationText = (notification: Notification) => {
    const senderName = notification.sender?.username || "Someone";
    switch (notification.type) {
      case "offer_received":
        return `${senderName} sent you an offer!`;
      case "offer_accepted":
        return `${senderName} accepted your offer!`;
      case "offer_declined":
        return `${senderName} declined your offer.`;
      case "match_scheduled":
        return `Match scheduled with ${senderName}.`;
      default:
        return "New notification";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="grid">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.sender?.avatar_url || ""} />
                      <AvatarFallback>{notification.sender?.username?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
