import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Profile, ConversationWithContext, SwapSummary, markConversationRead } from "@/lib/chat";

// ============================================================
// useConversations — list of conversations for the current user
// with partner profile + last message + unread count, live-updated.
// ============================================================
export function useConversations(meId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationWithContext[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!meId) return;
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_a.eq.${meId},participant_b.eq.${meId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const partnerIds = (convs ?? []).map((c) =>
      c.participant_a === meId ? c.participant_b : c.participant_a,
    );

    const [profilesRes, messagesRes] = await Promise.all([
      partnerIds.length
        ? supabase.from("profiles").select("*").in("id", partnerIds)
        : Promise.resolve({ data: [] as Profile[], error: null }),
      (convs ?? []).length
        ? supabase
            .from("messages")
            .select("*")
            .in("conversation_id", convs!.map((c) => c.id))
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as Message[], error: null }),
    ]);

    const profileById = new Map<string, Profile>(
      (profilesRes.data ?? []).map((p) => [p.id, p as Profile]),
    );
    const allMessages = (messagesRes.data ?? []) as Message[];

    const enriched: ConversationWithContext[] = (convs ?? []).map((c) => {
      const partnerId = c.participant_a === meId ? c.participant_b : c.participant_a;
      const msgs = allMessages.filter((m) => m.conversation_id === c.id);
      return {
        ...c,
        partner: profileById.get(partnerId) ?? {
          id: partnerId,
          display_name: "Unknown",
          avatar_url: null,
          bio: null,
        },
        lastMessage: msgs[0] ?? null,
        unreadCount: msgs.filter((m) => m.sender_id !== meId && !m.read_at).length,
      };
    });

    setConversations(enriched);
    setLoading(false);
  }, [meId]);

  useEffect(() => {
    load();
  }, [load]);

  // Subscribe to message inserts to refresh list (debounced via reload)
  useEffect(() => {
    if (!meId) return;
    const channel = supabase
      .channel(`conversations-list-${meId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [meId, load]);

  return { conversations, loading, reload: load };
}

// ============================================================
// useMessages — live message stream for a single conversation.
// Auto-marks incoming messages as read.
// ============================================================
export function useMessages(conversationId: string | undefined, meId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !meId) return;
    let active = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) console.error(error);
      if (active) {
        setMessages((data ?? []) as Message[]);
        setLoading(false);
      }
      await markConversationRead(conversationId, meId);
    })();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
          if (msg.sender_id !== meId) {
            markConversationRead(conversationId, meId);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, meId]);

  return { messages, loading };
}
