import { supabase } from "@/integrations/supabase/client";

export type AppealActionType = "warning" | "restriction" | "ban" | "report_outcome" | "flag";
export type AppealStatus = "submitted" | "under_review" | "need_more_info" | "approved" | "denied" | "withdrawn";

export const ACTION_TYPES: { value: AppealActionType; label: string }[] = [
  { value: "warning", label: "Warning" },
  { value: "restriction", label: "Restriction" },
  { value: "ban", label: "Ban" },
  { value: "report_outcome", label: "Report outcome" },
  { value: "flag", label: "Moderation flag" },
];

export async function submitAppeal(input: {
  actionType: AppealActionType;
  reason: string;
  evidence?: string;
  relatedReportId?: string;
  relatedFlagId?: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in to appeal");
  const { data, error } = await supabase
    .from("appeals")
    .insert({
      user_id: auth.user.id,
      action_type: input.actionType,
      reason: input.reason.trim(),
      evidence: input.evidence?.trim() || null,
      related_report_id: input.relatedReportId ?? null,
      related_flag_id: input.relatedFlagId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function withdrawAppeal(appealId: string) {
  const { error } = await supabase
    .from("appeals")
    .update({ status: "withdrawn" })
    .eq("id", appealId);
  if (error) throw error;
}

export async function listMyAppeals() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("appeals")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllAppeals(status?: AppealStatus) {
  let q = supabase
    .from("appeals")
    .select(`*, profile:user_id(display_name, avatar_url)`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function decideAppeal(input: {
  appealId: string;
  status: Extract<AppealStatus, "approved" | "denied" | "under_review" | "need_more_info">;
  decision?: string;
  decisionReason?: string;
  cooldownDays?: number;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const patch: Record<string, unknown> = {
    status: input.status,
    reviewer_id: auth.user?.id ?? null,
    decision: input.decision ?? null,
    decision_reason: input.decisionReason ?? null,
  };
  if (input.status === "denied" && input.cooldownDays && input.cooldownDays > 0) {
    patch.cooldown_until = new Date(Date.now() + input.cooldownDays * 86400000).toISOString();
  }
  const { error } = await supabase.from("appeals").update(patch).eq("id", input.appealId);
  if (error) throw error;
}

export async function listAppealNotes(appealId: string) {
  const { data, error } = await supabase
    .from("appeal_notes")
    .select(`*, author:author_id(display_name, avatar_url)`)
    .eq("appeal_id", appealId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addAppealNote(input: { appealId: string; body: string; isInternal?: boolean }) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in");
  const { error } = await supabase.from("appeal_notes").insert({
    appeal_id: input.appealId,
    author_id: auth.user.id,
    body: input.body.trim(),
    is_internal: !!input.isInternal,
  });
  if (error) throw error;
}

export const STATUS_TONE: Record<AppealStatus, string> = {
  submitted: "bg-blue-500/10 text-blue-500",
  under_review: "bg-amber-500/10 text-amber-500",
  need_more_info: "bg-purple-500/10 text-purple-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  denied: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};
