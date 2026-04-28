import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  swap_id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  created_at: string;
}

export interface SwapSummary {
  id: string;
  requester_id: string;
  provider_id: string;
  requester_offer_title: string;
  provider_offer_title: string;
  status: string;
  scheduled_at: string | null;
  duration_minutes: number;
}

export interface ConversationWithContext extends Conversation {
  swap: SwapSummary;
  partner: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

const orderPair = (x: string, y: string): [string, string] =>
  x < y ? [x, y] : [y, x];

/**
 * Get-or-create the dedicated conversation for a swap.
 * Enforces 1 conversation per swap via the unique constraint on swap_id.
 */
export async function getOrCreateSwapConversation(
  swapId: string,
  meId: string,
): Promise<Conversation> {
  // 1. Look up existing
  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("swap_id", swapId)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing as Conversation;

  // 2. Need participants — pull from the swap
  const { data: swap, error: swapErr } = await supabase
    .from("swaps")
    .select("requester_id, provider_id")
    .eq("id", swapId)
    .single();

  if (swapErr) throw swapErr;
  if (swap.requester_id !== meId && swap.provider_id !== meId) {
    throw new Error("You are not a participant in this swap.");
  }

  const [a, b] = orderPair(swap.requester_id, swap.provider_id);

  const { data: created, error: insertErr } = await supabase
    .from("conversations")
    .insert({ swap_id: swapId, participant_a: a, participant_b: b })
    .select()
    .single();

  if (insertErr) {
    // Race condition: someone else created it first — re-fetch.
    if (insertErr.code === "23505") {
      const { data: row } = await supabase
        .from("conversations").select("*").eq("swap_id", swapId).single();
      if (row) return row as Conversation;
    }
    throw insertErr;
  }
  return created as Conversation;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Empty message.");
  if (trimmed.length > 4000) throw new Error("Message too long.");

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content: trimmed })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

/** Mark all unread messages in a conversation that were NOT sent by `me` as read. */
export async function markConversationRead(conversationId: string, meId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", meId)
    .is("read_at", null);
}

/** List all conversations the user is part of, with swap context + partner profile. */
export async function listMyConversations(meId: string): Promise<ConversationWithContext[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      swap:swaps!inner(
        id, requester_id, provider_id,
        requester_offer_title, provider_offer_title, status, scheduled_at, duration_minutes
      )
    `)
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const partnerIds = Array.from(new Set(
    data.map((c: any) => (c.participant_a === meId ? c.participant_b : c.participant_a))
  ));

  const { data: profiles } = await supabase
    .from("profiles").select("*").in("id", partnerIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p as Profile]));

  // Last message + unread count per conversation
  const out: ConversationWithContext[] = [];
  for (const c of data as any[]) {
    const partnerId = c.participant_a === meId ? c.participant_b : c.participant_a;
    const [{ data: lastArr }, { count }] = await Promise.all([
      supabase.from("messages").select("*").eq("conversation_id", c.id)
        .order("created_at", { ascending: false }).limit(1),
      supabase.from("messages").select("*", { count: "exact", head: true })
        .eq("conversation_id", c.id).neq("sender_id", meId).is("read_at", null),
    ]);

    out.push({
      ...c,
      swap: c.swap as SwapSummary,
      partner: profileMap.get(partnerId) ?? {
        id: partnerId, display_name: "Unknown", avatar_url: null, bio: null,
      },
      lastMessage: (lastArr?.[0] ?? null) as Message | null,
      unreadCount: count ?? 0,
    });
  }
  return out;
}

/** Subscribe to new messages in a specific swap conversation. */
export function subscribeToConversation(
  conversationId: string,
  onMessage: (m: Message) => void,
) {
  const channel = supabase
    .channel(`conv:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
