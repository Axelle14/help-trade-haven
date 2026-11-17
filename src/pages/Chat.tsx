import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Check, CheckCheck, MessageCircle, Repeat2, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages } from "@/hooks/useChat";
import { sendMessage, getOrCreateSwapConversation, type SwapSummary } from "@/lib/chat";
import { SchedulePanel } from "@/components/SchedulePanel";
import { TrustBadge } from "@/components/TrustBadge";
import { ReportUserDialog } from "@/components/ReportUserDialog";
import { BlockUserButton } from "@/components/BlockUserButton";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    style={{ width: size, height: size, background: avatarGradient(id), fontSize: size * 0.32 }}
  >
    {initialsOf(name)}
  </div>
);

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  accepted: "bg-primary/15 text-primary",
  active: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  declined: "bg-destructive/10 text-destructive",
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", STATUS_STYLES[status] ?? "bg-muted text-muted-foreground")}>
    <Circle className="w-2 h-2 fill-current" />
    {status}
  </span>
);

const SwapContextCard = ({
  swap, meId, partnerName,
}: { swap: SwapSummary; meId: string; partnerName: string }) => {
  const iAmRequester = swap.requester_id === meId;
  const myOffer = iAmRequester ? swap.requester_offer_title : swap.provider_offer_title;
  const theirOffer = iAmRequester ? swap.provider_offer_title : swap.requester_offer_title;

  return (
    <div className="bg-gradient-to-r from-secondary/60 to-card border-b border-foreground/5 px-4 py-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Swap context
        </p>
        <StatusPill status={swap.status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-xs">
        <div className="bg-card rounded-xl p-2.5 border border-foreground/5">
          <p className="text-[10px] text-muted-foreground mb-0.5">You give</p>
          <p className="font-semibold text-foreground truncate">{myOffer}</p>
        </div>
        <Repeat2 className="w-4 h-4 text-primary shrink-0" />
        <div className="bg-card rounded-xl p-2.5 border border-foreground/5">
          <p className="text-[10px] text-muted-foreground mb-0.5">{partnerName} gives</p>
          <p className="font-semibold text-foreground truncate">{theirOffer}</p>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();
  const { swapId } = useParams<{ swapId?: string }>();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [openingSwap, setOpeningSwap] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const { conversations, loading: convsLoading } = useConversations(user?.id);

  // When a swapId is in the URL, get-or-create that swap's conversation and open it.
  useEffect(() => {
    if (!user || !swapId) return;
    let active = true;
    (async () => {
      setOpeningSwap(true);
      try {
        const conv = await getOrCreateSwapConversation(swapId, user.id);
        if (active) setActiveConvId(conv.id);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Could not open chat");
        navigate("/chat");
      } finally {
        if (active) setOpeningSwap(false);
      }
    })();
    return () => { active = false; };
  }, [swapId, user, navigate]);

  const { messages } = useMessages(activeConvId ?? undefined, user?.id);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? null,
    [conversations, activeConvId],
  );

  // Group conversations by swap status for the sidebar
  const grouped = useMemo(() => {
    const groups: Record<string, typeof conversations> = { active: [], pending: [], other: [] };
    for (const c of conversations) {
      if (c.swap.status === "active" || c.swap.status === "accepted") groups.active.push(c);
      else if (c.swap.status === "pending") groups.pending.push(c);
      else groups.other.push(c);
    }
    return groups;
  }, [conversations]);

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

  const renderConvButton = (c: typeof conversations[number]) => {
    const iAmRequester = c.swap.requester_id === user.id;
    const theirOffer = iAmRequester ? c.swap.provider_offer_title : c.swap.requester_offer_title;
    return (
      <button
        key={c.id}
        onClick={() => {
          setActiveConvId(c.id);
          navigate(`/chat/swap/${c.swap_id}`);
        }}
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
          <p className="text-[11px] text-primary font-medium truncate flex items-center gap-1">
            <Repeat2 className="w-3 h-3 shrink-0" />
            {theirOffer}
          </p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
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
    );
  };

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
          <h1 className="font-display font-bold text-xl">Swap chats</h1>
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
            <div className="p-4 border-b border-foreground/5">
              <p className="font-display font-bold text-sm">Your swap conversations</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                One chat per swap — keeps every trade clear.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading && (
                <p className="p-4 text-xs text-muted-foreground">Loading…</p>
              )}
              {!convsLoading && conversations.length === 0 && (
                <div className="p-6 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">No swap chats yet</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Start a swap to open a chat with the other person.
                  </p>
                  <Link to="/matches">
                    <Button size="sm" variant="outline">Find a match</Button>
                  </Link>
                </div>
              )}

              {grouped.active.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-success">
                    Active swaps
                  </p>
                  {grouped.active.map(renderConvButton)}
                </div>
              )}
              {grouped.pending.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                    Pending
                  </p>
                  {grouped.pending.map(renderConvButton)}
                </div>
              )}
              {grouped.other.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Past
                  </p>
                  {grouped.other.map(renderConvButton)}
                </div>
              )}
            </div>
          </aside>

          {/* Thread */}
          <section className={cn(
            "bg-card rounded-3xl shadow-soft border border-foreground/5 flex flex-col overflow-hidden",
            !activeConvId && "hidden md:flex",
          )}>
            {openingSwap && (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Opening swap chat…
              </div>
            )}

            {!openingSwap && !activeConv && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <MessageCircle className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="font-display font-bold text-xl mb-2">Pick a swap</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Each chat is tied to a specific swap, so context never gets mixed up.
                </p>
              </div>
            )}

            {!openingSwap && activeConv && (
              <>
                <header className="p-4 border-b border-foreground/5 flex items-center gap-3">
                  <button
                    onClick={() => { setActiveConvId(null); navigate("/chat"); }}
                    className="md:hidden w-9 h-9 rounded-xl bg-background/60 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar id={activeConv.partner.id} name={activeConv.partner.display_name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{activeConv.partner.display_name}</p>
                      <TrustBadge userId={activeConv.partner.id} compact />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Swap chat</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ReportUserDialog
                      reportedUserId={activeConv.partner.id}
                      reportedUserName={activeConv.partner.display_name}
                      swapId={activeConv.swap.id}
                    />
                    <BlockUserButton
                      otherUserId={activeConv.partner.id}
                      otherUserName={activeConv.partner.display_name}
                    />
                  </div>
                </header>

                <SwapContextCard
                  swap={activeConv.swap}
                  meId={user.id}
                  partnerName={activeConv.partner.display_name}
                />

                <SchedulePanel
                  swapId={activeConv.swap.id}
                  meId={user.id}
                  partnerId={activeConv.partner.id}
                  partnerName={activeConv.partner.display_name}
                  scheduledAt={activeConv.swap.scheduled_at}
                  defaultDuration={activeConv.swap.duration_minutes}
                />

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
                    placeholder={`Message about your ${activeConv.swap.requester_id === user.id ? activeConv.swap.provider_offer_title : activeConv.swap.requester_offer_title} swap…`}
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
    </div>
  );
};

export default Chat;

// Suppress unused-import warning during transition; supabase still re-exported elsewhere if needed.
void supabase;
