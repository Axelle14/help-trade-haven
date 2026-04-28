import { supabase } from "@/integrations/supabase/client";

// ============================================================
// Notification model + dispatch
// ============================================================
//
// Most notifications are created server-side via triggers (messages,
// swap_request, swap_update, schedule proposals).
//
// Some are dispatched client-side, for the user's own context:
//   - match_suggestion (low)
//   - reward          (low)
//   - system          (medium)
//
// Delivery rules:
//   high   → push + in-app
//   medium → in-app + optional push (respect user preference)
//   low    → in-app only (badge / list)
//
// Push delivery is a stub here (`maybeSendPush`) — wire it to a real
// Web Push / FCM transport when ready. We still record `is_push_sent`
// so the dispatcher won't double-send.
// ============================================================

export type NotificationCategory =
  | "message"
  | "swap_request"
  | "swap_update"
  | "match_suggestion"
  | "reward"
  | "system";

export type NotificationPriority = "high" | "medium" | "low";

export interface AppNotification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string | null;
  link: string | null;
  data: Record<string, unknown>;
  group_key: string | null;
  is_push_sent: boolean;
  read_at: string | null;
  created_at: string;
}

const DEFAULT_PRIORITY: Record<NotificationCategory, NotificationPriority> = {
  message: "high",
  swap_request: "high",
  swap_update: "medium",
  match_suggestion: "low",
  reward: "low",
  system: "medium",
};

export interface CreateNotificationInput {
  userId: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  link?: string;
  data?: Record<string, unknown>;
  groupKey?: string;
  priority?: NotificationPriority;
}

/**
 * Client-side dispatch (used for self-targeted notifications like rewards
 * or local match suggestions). Server-side triggers handle cross-user
 * notifications because they need elevated privileges.
 */
export async function dispatchNotification(
  input: CreateNotificationInput,
): Promise<AppNotification> {
  const priority = input.priority ?? DEFAULT_PRIORITY[input.category];

  const { data, error } = await (supabase
    .from("notifications" as any) as any)
    .insert({
      user_id: input.userId,
      category: input.category,
      priority,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      data: input.data ?? {},
      group_key: input.groupKey ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  const created = data as AppNotification;
  await maybeSendPush(created);
  return created;
}

/** Stub for real push delivery — flips is_push_sent so we don't repeat. */
async function maybeSendPush(n: AppNotification) {
  if (n.priority === "low") return; // low → in-app only
  // medium → optional push (skip until user preference UI exists)
  if (n.priority === "medium") return;

  // high → would call your push transport here. Mark sent so dashboards
  // and re-sync logic stay accurate.
  await supabase
    .from("notifications")
    .update({ is_push_sent: true })
    .eq("id", n.id);
}

// ============================================================
// Reads
// ============================================================

export async function listNotifications(
  meId: string,
  opts: { limit?: number; onlyUnread?: boolean; category?: NotificationCategory } = {},
): Promise<AppNotification[]> {
  const client = supabase as any;
  let q = client
    .from("notifications")
    .select("*")
    .eq("user_id", meId)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.onlyUnread) q = q.is("read_at", null);
  if (opts.category) q = q.eq("category", opts.category);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markNotificationRead(id: string) {
  await (supabase as any)
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
}

export async function markAllNotificationsRead(meId: string) {
  await (supabase as any)
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", meId)
    .is("read_at", null);
}

export async function markGroupRead(meId: string, groupKey: string) {
  await (supabase as any)
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", meId)
    .eq("group_key", groupKey)
    .is("read_at", null);
}

// ============================================================
// Grouping helper for the UI: collapse same group_key into one row
// showing the most recent item + a count badge.
// ============================================================

export interface NotificationGroup {
  key: string;
  latest: AppNotification;
  count: number;
  unread: number;
  items: AppNotification[];
}

export function groupNotifications(items: AppNotification[]): NotificationGroup[] {
  const map = new Map<string, NotificationGroup>();
  for (const n of items) {
    const key = n.group_key ?? `single:${n.id}`;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(n);
      existing.count += 1;
      if (!n.read_at) existing.unread += 1;
      // keep newest as `latest`
      if (n.created_at > existing.latest.created_at) existing.latest = n;
    } else {
      map.set(key, {
        key,
        latest: n,
        count: 1,
        unread: n.read_at ? 0 : 1,
        items: [n],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    b.latest.created_at.localeCompare(a.latest.created_at),
  );
}

export const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortByPriorityThenTime(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return b.created_at.localeCompare(a.created_at);
  });
}
