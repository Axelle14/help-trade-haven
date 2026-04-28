import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Repeat2,
  CalendarClock,
  Sparkles,
  Trophy,
  Info,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  AppNotification,
  groupNotifications,
  NotificationCategory,
  sortByPriorityThenTime,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationCategory, JSX.Element> = {
  message: <MessageSquare className="w-4 h-4" />,
  swap_request: <Repeat2 className="w-4 h-4" />,
  swap_update: <CalendarClock className="w-4 h-4" />,
  match_suggestion: <Sparkles className="w-4 h-4" />,
  reward: <Trophy className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
};

const PRIORITY_DOT: Record<AppNotification["priority"], string> = {
  high: "bg-destructive",
  medium: "bg-primary",
  low: "bg-muted-foreground/40",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

type Filter = "all" | "high" | "swaps" | "messages";

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const { items, unreadCount, markRead, markAllRead, markGroup } =
    useNotifications(user?.id);

  const filtered = useMemo(() => {
    const sorted = sortByPriorityThenTime(items);
    switch (filter) {
      case "high":
        return sorted.filter((n) => n.priority === "high");
      case "swaps":
        return sorted.filter(
          (n) => n.category === "swap_request" || n.category === "swap_update",
        );
      case "messages":
        return sorted.filter((n) => n.category === "message");
      default:
        return sorted;
    }
  }, [items, filter]);

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);

  const handleOpen = (n: AppNotification, groupKey: string) => {
    if (n.group_key) markGroup(n.group_key);
    else markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1",
                "rounded-full text-[10px] font-bold flex items-center justify-center",
                "bg-destructive text-destructive-foreground border-2 border-background",
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => markAllRead()}
            >
              <Check className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <div className="px-2 pt-2">
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="high" className="text-xs">Priority</TabsTrigger>
              <TabsTrigger value="swaps" className="text-xs">Swaps</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="m-0">
            <ScrollArea className="h-[420px]">
              {groups.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  You're all caught up.
                </div>
              ) : (
                <ul className="py-1">
                  {groups.map((g) => {
                    const n = g.latest;
                    const unread = g.unread > 0;
                    return (
                      <li key={g.key}>
                        <button
                          onClick={() => handleOpen(n, g.key)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex gap-3 items-start",
                            "hover:bg-accent/40 transition-colors",
                            unread && "bg-accent/20",
                          )}
                        >
                          <div className="relative shrink-0">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center",
                                "bg-primary/10 text-primary",
                              )}
                            >
                              {ICONS[n.category]}
                            </div>
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                                PRIORITY_DOT[n.priority],
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm leading-snug truncate",
                                  unread ? "font-semibold" : "font-medium text-muted-foreground",
                                )}
                              >
                                {n.title}
                                {g.count > 1 && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">
                                    ·{" "}
                                    <span className="font-normal">
                                      {g.count} updates
                                    </span>
                                  </span>
                                )}
                              </p>
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                {timeAgo(n.created_at)}
                              </span>
                            </div>
                            {n.body && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {n.body}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
