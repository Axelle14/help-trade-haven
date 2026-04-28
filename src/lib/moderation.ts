import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReportReason = "scam" | "inappropriate" | "no_show" | "harassment" | "spam" | "other";
export type ReportStatus = "open" | "reviewing" | "actioned" | "dismissed";

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "scam", label: "Scam or fraud", description: "Tried to deceive me or steal value" },
  { value: "inappropriate", label: "Inappropriate behavior", description: "Offensive, sexual, or abusive content" },
  { value: "no_show", label: "No-show", description: "Didn't show up to a confirmed swap" },
  { value: "harassment", label: "Harassment", description: "Repeated unwanted contact or threats" },
  { value: "spam", label: "Spam", description: "Promotional or repetitive messages" },
  { value: "other", label: "Other", description: "Something else worth reviewing" },
];

export async function submitReport(input: {
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  swapId?: string;
  messageId?: string;
  severity?: number;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in to report");
  if (auth.user.id === input.reportedUserId) throw new Error("You cannot report yourself");

  const { error } = await supabase.from("reports").insert({
    reporter_id: auth.user.id,
    reported_user_id: input.reportedUserId,
    reason: input.reason,
    details: input.details?.trim() || null,
    swap_id: input.swapId ?? null,
    message_id: input.messageId ?? null,
    severity: Math.max(1, Math.min(5, input.severity ?? 2)),
  });
  if (error) throw error;
}

export async function blockUser(blockedUserId: string, reason?: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in to block");
  if (auth.user.id === blockedUserId) throw new Error("You cannot block yourself");
  const { error } = await supabase.from("blocked_users").insert({
    user_id: auth.user.id,
    blocked_user_id: blockedUserId,
    reason: reason?.trim() || null,
  });
  if (error && !String(error.message).includes("duplicate")) throw error;
}

export async function unblockUser(blockedUserId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in");
  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("blocked_user_id", blockedUserId);
  if (error) throw error;
}

export async function isUserBlocked(otherUserId: string): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase
    .from("blocked_users")
    .select("id")
    .or(
      `and(user_id.eq.${auth.user.id},blocked_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},blocked_user_id.eq.${auth.user.id})`
    )
    .limit(1)
    .maybeSingle();
  return !!data;
}

export async function listMyBlocks() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("blocked_users")
    .select("id, blocked_user_id, reason, created_at, profiles:blocked_user_id(display_name, avatar_url)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTrustScore(userId: string) {
  const { data } = await supabase
    .from("trust_scores")
    .select("score, status, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? { score: 100, status: "good", updated_at: null };
}

export async function isModeratorOrAdmin(): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .in("role", ["admin", "moderator"]);
  return (data?.length ?? 0) > 0;
}

// ===== Admin / moderator =====
export async function listAllReports(status?: ReportStatus) {
  let q = supabase
    .from("reports")
    .select(
      `id, reason, details, status, severity, created_at,
       reporter_id, reported_user_id, swap_id,
       reporter:reporter_id(display_name, avatar_url),
       reported:reported_user_id(display_name, avatar_url)`
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateReportStatus(reportId: string, status: ReportStatus, reviewerNotes?: string) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewer_id: auth.user?.id ?? null,
      reviewer_notes: reviewerNotes ?? null,
    })
    .eq("id", reportId);
  if (error) throw error;
}

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
