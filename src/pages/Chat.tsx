import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Search, Check, CheckCheck, Plus, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages } from "@/hooks/useChat";
import { sendMessage, getOrCreateConversation, Profile } from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const initialsOf = (name: string) =>
  name.split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("") || "?";

const avatarGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${h1} 75% 65%), hsl(${h2} 80% 70%))`;
};

const Avatar = ({ id, name, size = 44 }: { id: string; name: string; size?: number }) => (
  <div
    className="rounded-2xl flex items-center justify-center text-primary-foreground font-bold shadow-soft shrink-0"
    style={{
      width: size,
      height: size,
      background: avatarGradient(id),
      fontSize: size * 0.32,
    }}
  >
    {initialsOf(name)}
  </div>
);

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const { conversations, loading: convsLoading } = useConversations(user?.id);
  const { messages } = useMessages(activeConvId ?? undefined, user?.id);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? null,
    [conversations, activeConvId],
  );

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeConvId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !activeConvId || !input.trim()) return;
    const text = input;
    setInput("");
    try {
      await sendMessage(activeConvId, user.id, text);
    } catch (err: unknown) {
      setInput(text);
      toast.error(err instanceof Error ? err.message : "Could not send message");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-6 md:py-10">
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-xl">Messages</h1>
          <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/auth"))}>
            Sign out
          </Button>
        </header>

        <div className="grid md:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-9rem)] min-h-[500px]">
          {/* Sidebar */}
          <aside className={cn(
            "bg-card rounded-3xl shadow-soft border border-foreground/5 flex flex-col overflow-hidden",
            activeConvId && "hidden md:flex",
          )}>
            <div className="p-4 border-b border-foreground/5 flex items-center justify-between gap-2">
              <p className="font-display font-bold text-sm">Conversations</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-bounce"
                title="New conversation"
              >
                <Plus className="w-4 h-4" strokeWidth={2.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading && (
                <p className="p-4 text-xs text-muted-foreground">Loading…</p>
              )}
              {!convsLoading && conversations.length === 0 && (
                <div className="p-6 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">No conversations yet</p>
                  <p className="text-xs text-muted-foreground">Start one with another member.</p>
                </div>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={cn(
                    "w-full text-left p-3 flex items-center gap-3 hover:bg-background/40 transition-smooth border-l-2",
                    activeConvId === c.id ? "bg-background/40 border-primary" : "border-transparent",
                  )}
                >
                  <Avatar id={c.partner.id} name={c.partner.display_name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate">{c.partner.display_name}</p>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(c.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMessage?.content ?? "Say hi 👋"}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Thread */}
          <section className={cn(
            "bg-card rounded-3xl shadow-soft border border-foreground/5 flex flex-col overflow-hidden",
            !activeConvId && "hidden md:flex",
          )}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <MessageCircle className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="font-display font-bold text-xl mb-2">Pick a conversation</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Select a chat from the left, or start a new one to begin swapping.
                </p>
              </div>
            ) : (
              <>
                <header className="p-4 border-b border-foreground/5 flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden w-9 h-9 rounded-xl bg-background/60 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar id={activeConv.partner.id} name={activeConv.partner.display_name} size={40} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{activeConv.partner.display_name}</p>
                    <p className="text-[11px] text-success font-medium">● Online</p>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => {
                      const mine = m.sender_id === user.id;
                      const prev = messages[i - 1];
                      const showTime =
                        !prev ||
                        new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000;

                      return (
                        <div key={m.id}>
                          {showTime && (
                            <p className="text-center text-[10px] text-muted-foreground my-3">
                              {formatTime(m.created_at)}
                            </p>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("flex", mine ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-soft",
                                mine
                                  ? "gradient-primary text-primary-foreground rounded-br-md"
                                  : "bg-background text-foreground rounded-bl-md",
                              )}
                            >
                              <p className="text-sm leading-snug whitespace-pre-wrap break-words">{m.content}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1 text-[10px]",
                                mine ? "text-primary-foreground/70 justify-end" : "text-muted-foreground",
                              )}>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                {mine && (m.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-foreground/5 flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="rounded-full h-11 bg-background border-0 px-4"
                    maxLength={4000}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none hover:scale-105 transition-bounce shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>

      {showNewChat && (
        <NewChatDialog
          meId={user.id}
          onClose={() => setShowNewChat(false)}
          onStarted={(convId) => {
            setActiveConvId(convId);
            setShowNewChat(false);
          }}
        />
      )}
    </div>
  );
};

// =====================================================
// New chat — search profiles & open/create conversation
// =====================================================
const NewChatDialog = ({
  meId,
  onClose,
  onStarted,
}: {
  meId: string;
  onClose: () => void;
  onStarted: (convId: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      const q = supabase.from("profiles").select("*").neq("id", meId).limit(20);
      const final = query.trim() ? q.ilike("display_name", `%${query.trim()}%`) : q;
      const { data, error } = await final;
      if (error) console.error(error);
      if (active) setResults((data ?? []) as Profile[]);
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, meId]);

  const start = async (other: Profile) => {
    setBusy(true);
    try {
      const conv = await getOrCreateConversation(meId, other.id);
      onStarted(conv.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start conversation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-3xl shadow-float border border-foreground/5 w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-foreground/5">
          <p className="font-display font-bold mb-3">Start a new chat</p>
          <div className="flex items-center gap-2 bg-background rounded-2xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by name…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No members found. Invite a friend to join Service Swap!
            </p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => start(p)}
              disabled={busy}
              className="w-full p-3 flex items-center gap-3 hover:bg-background/50 transition-smooth disabled:opacity-50"
            >
              <Avatar id={p.id} name={p.display_name} />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm truncate">{p.display_name}</p>
                {p.bio && <p className="text-xs text-muted-foreground truncate">{p.bio}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
