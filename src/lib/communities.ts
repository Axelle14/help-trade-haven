import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type City = Database["public"]["Tables"]["cities"]["Row"];
export type CityStats = Database["public"]["Tables"]["city_stats"]["Row"];
export type CityMessage = Database["public"]["Tables"]["city_messages"]["Row"];
export type CityMembership = Database["public"]["Tables"]["city_memberships"]["Row"];

export type CityWithStats = City & { stats: CityStats | null };

export async function listCities(): Promise<CityWithStats[]> {
  const [{ data: cities, error }, { data: stats }] = await Promise.all([
    supabase.from("cities").select("*").eq("is_active", true).order("name"),
    supabase.from("city_stats").select("*"),
  ]);
  if (error) throw error;
  const byCity = new Map((stats ?? []).map((s) => [s.city_id, s]));
  return (cities ?? []).map((c) => ({ ...c, stats: byCity.get(c.id) ?? null }));
}

export async function getCityBySlug(slug: string): Promise<CityWithStats | null> {
  const { data: city } = await supabase.from("cities").select("*").eq("slug", slug).maybeSingle();
  if (!city) return null;
  const { data: stats } = await supabase
    .from("city_stats").select("*").eq("city_id", city.id).maybeSingle();
  return { ...city, stats: stats ?? null };
}

export async function isMemberOfCity(cityId: string): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase
    .from("city_memberships")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("city_id", cityId)
    .maybeSingle();
  return !!data;
}

export async function joinCity(cityId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to join a community");
  const { error } = await supabase
    .from("city_memberships")
    .insert({ user_id: auth.user.id, city_id: cityId });
  if (error && !String(error.message).includes("duplicate")) throw error;
}

export async function leaveCity(cityId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { error } = await supabase
    .from("city_memberships")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("city_id", cityId);
  if (error) throw error;
}

export async function listCityMembers(cityId: string, limit = 24) {
  const { data: ms, error } = await supabase
    .from("city_memberships")
    .select("user_id, role, joined_at")
    .eq("city_id", cityId)
    .order("joined_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const ids = (ms ?? []).map((m) => m.user_id);
  if (!ids.length) return [];
  const [{ data: profiles }, { data: trust }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, bio").in("id", ids),
    supabase.from("trust_scores").select("user_id, score, status").in("user_id", ids),
  ]);
  const pMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const tMap = new Map((trust ?? []).map((t) => [t.user_id, t]));
  return (ms ?? []).map((m) => ({
    ...m,
    profile: pMap.get(m.user_id) ?? { id: m.user_id, display_name: "Member", avatar_url: null, bio: null },
    trust: tMap.get(m.user_id) ?? { score: 100, status: "good" as const },
  }));
}

export async function listCityMessages(cityId: string, limit = 50): Promise<CityMessage[]> {
  const { data, error } = await supabase
    .from("city_messages")
    .select("*")
    .eq("city_id", cityId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function sendCityMessage(cityId: string, message: string) {
  const trimmed = message.trim();
  if (!trimmed) return;
  if (trimmed.length > 1000) throw new Error("Message too long");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to chat");
  const { error } = await supabase
    .from("city_messages")
    .insert({ city_id: cityId, sender_id: auth.user.id, message: trimmed });
  if (error) throw error;
}

export async function hideCityMessage(messageId: string, reason?: string) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("city_messages")
    .update({ status: "hidden", hidden_by: auth.user?.id ?? null, hidden_reason: reason ?? null })
    .eq("id", messageId);
  if (error) throw error;
}

export async function reactToMessage(messageId: string, emoji: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to react");
  const { error } = await supabase
    .from("city_message_reactions")
    .insert({ message_id: messageId, user_id: auth.user.id, emoji });
  if (error && !String(error.message).includes("duplicate")) throw error;
}

export async function getMessageSenders(senderIds: string[]) {
  if (!senderIds.length) return new Map<string, { display_name: string; avatar_url: string | null }>();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", senderIds);
  return new Map((data ?? []).map((p) => [p.id, { display_name: p.display_name, avatar_url: p.avatar_url }]));
}
