import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AppNotification,
  listNotifications,
  markAllNotificationsRead,
  markGroupRead,
  markNotificationRead,
  NotificationCategory,
} from "@/lib/notifications";

export function useNotifications(
  meId: string | undefined,
  opts: { category?: NotificationCategory } = {},
) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!meId) return;
    setLoading(true);
    try {
      const data = await listNotifications(meId, { category: opts.category });
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [meId, opts.category]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: react to inserts/updates for this user
  useEffect(() => {
    if (!meId) return;
    const channel = supabase
      .channel(`notifications-${meId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${meId}`,
        },
        (payload) => {
          const n = payload.new as AppNotification;
          if (opts.category && n.category !== opts.category) return;
          setItems((prev) =>
            prev.some((x) => x.id === n.id) ? prev : [n, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${meId}`,
        },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meId, opts.category]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    await markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!meId) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await markAllNotificationsRead(meId);
  }, [meId]);

  const markGroup = useCallback(
    async (groupKey: string) => {
      if (!meId) return;
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) =>
          n.group_key === groupKey && !n.read_at ? { ...n, read_at: now } : n,
        ),
      );
      await markGroupRead(meId, groupKey);
    },
    [meId],
  );

  return { items, loading, unreadCount, reload: load, markRead, markAllRead, markGroup };
}
