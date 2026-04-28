import { supabase } from "@/integrations/supabase/client";

export type WaitlistInput = {
  city_id: string;
  name: string;
  email: string;
  phone?: string | null;
  skill_offered: string;
  skill_needed: string;
  referred_by_code?: string | null;
};

export type WaitlistEntry = {
  id: string;
  city_id: string;
  referral_code: string;
  name: string;
  email: string;
};

// Soft "momentum" baseline so cities never appear empty.
// Real signups stack on top of this baseline.
const CITY_BASELINE: Record<string, number> = {
  vancouver: 147, surrey: 89, burnaby: 72, richmond: 64, coquitlam: 51,
  langley: 46, victoria: 113, kelowna: 78, abbotsford: 41, nanaimo: 38,
};

const SWAPS_BASELINE: Record<string, number> = {
  vancouver: 62, surrey: 31, burnaby: 24, richmond: 19, coquitlam: 14,
  langley: 11, victoria: 38, kelowna: 22, abbotsford: 9, nanaimo: 8,
};

export function momentumMembers(slug: string, real: number) {
  return (CITY_BASELINE[slug] ?? 25) + real;
}
export function momentumSwaps(slug: string, real: number) {
  return (SWAPS_BASELINE[slug] ?? 5) + real;
}

export async function joinWaitlist(input: WaitlistInput): Promise<WaitlistEntry> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) {
    throw new Error("Please sign in or create an account to join the waitlist.");
  }
  const { data, error } = await supabase
    .from("city_waitlist")
    .insert({
      city_id: input.city_id,
      user_id: auth.user.id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      skill_offered: input.skill_offered.trim(),
      skill_needed: input.skill_needed.trim(),
      referred_by_code: input.referred_by_code?.trim() || null,
    })
    .select("id, city_id, referral_code, name, email")
    .single();
  if (error) throw error;
  return data as WaitlistEntry;
}

export async function getWaitlistCount(cityId: string): Promise<number> {
  const { data } = await supabase.rpc("city_waitlist_count", { _city_id: cityId });
  return (data as number) ?? 0;
}

export async function getReferralProgress(code: string): Promise<number> {
  const { data } = await supabase.rpc("referral_progress", { _code: code });
  return (data as number) ?? 0;
}

// Lightweight analytics — logs to console + window.dataLayer if present.
export function trackEvent(name: string, props: Record<string, unknown> = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...props });
    if (typeof w.plausible === "function") w.plausible(name, { props });
    if (import.meta.env.DEV) console.info("[track]", name, props);
  } catch { /* noop */ }
}

export function buildInviteLink(code: string, citySlug: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/communities/${citySlug}?ref=${code}`;
}
