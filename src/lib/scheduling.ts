import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────
export interface AvailabilityWindow {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sun … 6 = Sat
  start_time: string;  // "HH:MM:SS"
  end_time: string;
  timezone: string;
  created_at: string;
}

export type ProposalStatus = "pending" | "accepted" | "declined" | "superseded";

export interface ScheduleProposal {
  id: string;
  swap_id: string;
  proposed_by: string;
  proposed_for: string;     // ISO timestamp
  duration_minutes: number;
  status: ProposalStatus;
  note: string | null;
  responded_at: string | null;
  responded_by: string | null;
  created_at: string;
}

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const browserTZ = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

// ─── Availability ────────────────────────────────────────────────────
export async function listAvailability(userId: string): Promise<AvailabilityWindow[]> {
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week").order("start_time");
  if (error) throw error;
  return (data ?? []) as AvailabilityWindow[];
}

export async function addAvailability(
  userId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  timezone: string = browserTZ(),
): Promise<AvailabilityWindow> {
  if (startTime >= endTime) throw new Error("End time must be after start time.");
  const { data, error } = await supabase
    .from("availability")
    .insert({ user_id: userId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, timezone })
    .select()
    .single();
  if (error) throw error;
  return data as AvailabilityWindow;
}

export async function removeAvailability(id: string): Promise<void> {
  const { error } = await supabase.from("availability").delete().eq("id", id);
  if (error) throw error;
}

// ─── Schedule proposals ──────────────────────────────────────────────
export async function listProposals(swapId: string): Promise<ScheduleProposal[]> {
  const { data, error } = await supabase
    .from("swap_schedule_proposals")
    .select("*")
    .eq("swap_id", swapId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ScheduleProposal[];
}

export async function proposeTime(
  swapId: string,
  proposerId: string,
  proposedFor: Date,
  durationMinutes: number = 60,
  note?: string,
): Promise<ScheduleProposal> {
  if (proposedFor.getTime() < Date.now() - 60_000) {
    throw new Error("Pick a time in the future.");
  }
  if (durationMinutes < 15 || durationMinutes > 8 * 60) {
    throw new Error("Duration must be between 15 minutes and 8 hours.");
  }
  const { data, error } = await supabase
    .from("swap_schedule_proposals")
    .insert({
      swap_id: swapId,
      proposed_by: proposerId,
      proposed_for: proposedFor.toISOString(),
      duration_minutes: durationMinutes,
      note: note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ScheduleProposal;
}

/** Server-side accept (atomic, conflict-checked, supersedes other pending proposals). */
export async function acceptProposal(proposalId: string): Promise<ScheduleProposal> {
  const { data, error } = await supabase.rpc("accept_schedule_proposal", { _proposal_id: proposalId });
  if (error) throw error;
  return data as ScheduleProposal;
}

export async function declineProposal(proposalId: string, meId: string): Promise<void> {
  const { error } = await supabase
    .from("swap_schedule_proposals")
    .update({ status: "declined", responded_at: new Date().toISOString(), responded_by: meId })
    .eq("id", proposalId)
    .eq("status", "pending");
  if (error) throw error;
}

/** Client-side conflict check (informational) — server still re-checks on accept. */
export async function checkConflict(
  swapId: string,
  proposedFor: Date,
  durationMinutes: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_schedule_conflict", {
    _swap_id: swapId,
    _start: proposedFor.toISOString(),
    _duration_minutes: durationMinutes,
  });
  if (error) throw error;
  return data as boolean;
}

/** Realtime: subscribe to proposal changes for a single swap. */
export function subscribeToProposals(
  swapId: string,
  onChange: () => void,
) {
  const channel = supabase
    .channel(`proposals:${swapId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "swap_schedule_proposals", filter: `swap_id=eq.${swapId}` },
      () => onChange(),
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ─── Helpers for UI ──────────────────────────────────────────────────
/**
 * Given a list of weekly availability windows + a date, return whether the
 * proposed start time falls inside ANY of those windows (in the user's tz).
 * Lightweight UI hint — server doesn't enforce this.
 */
export function isInsideAvailability(
  windows: AvailabilityWindow[],
  when: Date,
  durationMinutes: number,
): boolean {
  if (windows.length === 0) return true; // no info → don't warn
  const dow = when.getDay();
  const startMin = when.getHours() * 60 + when.getMinutes();
  const endMin = startMin + durationMinutes;
  return windows.some((w) => {
    if (w.day_of_week !== dow) return false;
    const [sh, sm] = w.start_time.split(":").map(Number);
    const [eh, em] = w.end_time.split(":").map(Number);
    const ws = sh * 60 + sm, we = eh * 60 + em;
    return startMin >= ws && endMin <= we;
  });
}

export const formatProposalTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
