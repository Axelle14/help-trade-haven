import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CityMessage,
  getMessageSenders,
  hideCityMessage,
  isMemberOfCity,
  joinCity,
  listCityMessages,
  reactToMessage,
  sendCityMessage,
} from "@/lib/communities";
import { isModeratorOrAdmin } from "@/lib/moderation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Flag, EyeOff, ShieldCheck, Smile } from "lucide-react";
import { toast } from "sonner";
import { ReportUserDialog } from "@/components/ReportUserDialog";

interface Props { cityId: string; cityName: string }

const QUICK_EMOJIS = ["👍", "🙌", "🔥", "❤️", "😂"];

export const CityChat = ({ cityId, cityName }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CityMessage[]>([]);
  const [senders, setSenders] = useState<Map<string, { display_name: string; avatar_url: string | null }>>(new Map());
  const [input, setInput] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // initial load
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      const member = await isMemberOfCity(cityId);
      if (!active) return;
      setIsMember(member);
      isModeratorOrAdmin().then((m) => active && setIsMod(m));
      if (member) {
        const msgs = await listCityMessages(cityId);
        if (!active) return;
        setMessages(msgs);
        const map = await getMessageSenders([...new Set(msgs.map((m) => m.sender_id))]);
        if (active) setSenders(map);
      }
    })();
    return () => { active = false; };
  }, [cityId, user]);

  // realtime subscription
  useEffect(() => {
    if (!isMember) return;
    const ch = supabase
      .channel(`city-chat-${cityId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "city_messages", filter: `city_id=eq.${cityId}` },
        async (payload) => {
          const m = payload.new as CityMessage;
          if (m.status !== "active") return;
          setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
          if (!senders.has(m.sender_id)) {
            const map = await getMessageSenders([m.sender_id]);
            setSenders((prev) => new Map([...prev, ...map]));
          }
        })
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "city_messages", filter: `city_id=eq.${cityId}` },
        (payload) => {
          const m = payload.new as CityMessage;
          if (m.status !== "active") {
            setMessages((prev) => prev.filter((x) => x.id !== m.id));
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [cityId, isMember, senders]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const handleJoin = async () => {
    try { await joinCity(cityId); setIsMember(true); toast.success(`Joined ${cityName}!`); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendCityMessage(cityId, input);
      setInput("");
    } catch (e: any) { toast.error(e.message); }
    finally { setSending(false); }
  };

  const handleHide = async (id: string) => {
    try { await hideCityMessage(id, "Hidden by moderator"); toast.success("Message hidden"); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleReact = async (id: string, emoji: string) => {
    try { await reactToMessage(id, emoji); }
    catch (e: any) { toast.error(e.message); }
  };

  if (!user) {
    return (
      <div className="rounded-3xl border border-foreground/10 bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">Sign in to join the conversation.</p>
        <Button asChild><a href="/auth">Sign in</a></Button>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="rounded-3xl border border-foreground/10 bg-card p-8 text-center">
        <h3 className="font-display font-bold text-xl mb-2">Join {cityName} to start chatting</h3>
        <p className="text-muted-foreground mb-4 text-sm">Be respectful. Be local. Trade skills, not money.</p>
        <Button onClick={handleJoin}>Join {cityName}</Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-foreground/10 bg-card overflow-hidden flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            Be the first to say hi to {cityName} 👋
          </div>
        )}
        {messages.map((m) => {
          const sender = senders.get(m.sender_id);
          const isMine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={sender?.avatar_url ?? undefined} />
                <AvatarFallback>{(sender?.display_name ?? "?").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1 group`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{sender?.display_name ?? "Member"}</span>
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.message}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-smooth flex items-center gap-1 text-xs">
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} onClick={() => handleReact(m.id, e)} className="hover:scale-125 transition-bounce">
                      {e}
                    </button>
                  ))}
                  {!isMine && (
                    <button onClick={() => setReportTarget({ id: m.sender_id, name: sender?.display_name ?? "Member" })}
                      className="text-muted-foreground hover:text-destructive ml-2 inline-flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Report
                    </button>
                  )}
                  {isMod && (
                    <button onClick={() => handleHide(m.id)}
                      className="text-muted-foreground hover:text-warning ml-2 inline-flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Hide
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-foreground/10 p-3 flex gap-2 bg-background/40">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${cityName}…`}
          maxLength={1000}
          className="rounded-full bg-card"
        />
        <Button type="submit" size="icon" disabled={sending || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
      <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-foreground/5 flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3" /> Community guidelines apply · 5s cooldown between messages
      </div>

      {reportTarget && (
        <ReportUserDialog
          userId={reportTarget.id}
          userName={reportTarget.name}
          open={!!reportTarget}
          onOpenChange={(o) => !o && setReportTarget(null)}
        />
      )}
    </div>
  );
};
