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
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  created_at: string;
}

export interface ConversationWithPartner extends Conversation {
  partner: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

/** Order ids so (a,b) is always (a,b) regardless of who initiates. */
const orderPair = (x: string, y: string): [string, string] =>
  x < y ? [x, y] : [y, x];

/** Get-or-create the 1-on-1 conversation between two users. */
export async function getOrCreateConversation(
  meId: string,
  otherId: string,
): Promise<Conversation> {
  if (meId === otherId) throw new Error("Cannot start a conversation with yourself.");
  const [a, b] = orderPair(meId, otherId);

  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing as Conversation;

  const { data: created, error: insertErr } = await supabase
    .from("conversations")
    .insert({ participant_a: a, participant_b: b })
    .select()
    .single();

  if (insertErr) throw insertErr;
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
