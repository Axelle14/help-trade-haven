/**
 * Notification service abstraction.
 *
 * Today: only handles in-app preferences + storing device tokens in our
 * `device_tokens` and `notification_preferences` tables.
 *
 * Future (when wrapped in Capacitor):
 *   import { PushNotifications } from "@capacitor/push-notifications";
 *   await PushNotifications.requestPermissions();
 *   PushNotifications.addListener("registration", t =>
 *     registerDeviceToken(userId, t.value, "ios")
 *   );
 *
 * Keep this module as the single integration point so swapping in APNs
 * or FCM later doesn't touch UI code.
 */
import { supabase } from "@/integrations/supabase/client";

export type Platform = "ios" | "android" | "web";

export interface NotificationPrefs {
  messages: boolean;
  booking_updates: boolean;
  new_requests: boolean;
  promotions: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  messages: true,
  booking_updates: true,
  new_requests: true,
  promotions: false,
};

export async function getMyPrefs(userId: string): Promise<NotificationPrefs> {
  const { data } = await (supabase as any)
    .from("notification_preferences")
    .select("messages,booking_updates,new_requests,promotions")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as NotificationPrefs) ?? DEFAULT_PREFS;
}

export async function upsertMyPrefs(userId: string, prefs: NotificationPrefs) {
  const { error } = await (supabase as any)
    .from("notification_preferences")
    .upsert({ user_id: userId, ...prefs }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: Platform,
  deviceName?: string,
) {
  const { error } = await (supabase as any)
    .from("device_tokens")
    .upsert(
      { user_id: userId, token, platform, device_name: deviceName, last_seen_at: new Date().toISOString() },
      { onConflict: "user_id,token" },
    );
  if (error) throw error;
}

export async function unregisterDeviceToken(userId: string, token: string) {
  await (supabase as any)
    .from("device_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token", token);
}

/** Stub: ask the user (or platform) for permission. */
export async function requestPushPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "prompt";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const r = await Notification.requestPermission();
  return r as any;
}
