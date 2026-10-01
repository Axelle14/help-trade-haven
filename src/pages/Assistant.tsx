import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2, MapPin, ShieldCheck, ArrowUp, Bot } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { placePointOrder } from "@/lib/orders";
import { toast } from "sonner";

export const SUGGESTED_PROMPTS = [
  "I need a cleaner",
  "Find a plumber",
  "Book a hairdresser",
  "Find someone to paint my house",
  "Get a quote for landscaping",
  "Find someone nearby",
];

const STEPS = [
  "Understanding your request",
  "Identifying the service",
  "Searching providers",
  "Checking location",
  "Checking availability",
  "Comparing trust signals",
];

interface Provider {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  point_price: number;
  delivery_type: string;
  city_name: string | null;
  province: string | null;
  display_name: string | null;
  avatar_url: string | null;
  trust_score: number;
  distance_km: number | null;
  reasons: string[];
}

interface Result {
  task_id: string | null;
  reply: string;
  providers: Provider[];
}

interface Turn {
  request: string;
  result?: Result;
  error?: string;
}

const Assistant = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  const ask = async (text: string) => {
    const request = text.trim();
    if (!request || busy) return;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/assistant?q=${request}`)}`);
      return;
    }
    setInput("");
    setBusy(true);
    setStep(0);
    setTurns((t) => [...t, { request }]);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    const { data, error } = await supabase.functions.invoke("ai-assistant", { body: { request } });
    clearInterval(timer);
    let msg: string | undefined;
    if (error) {
      try { msg = (await (error as any).context?.json())?.error; } catch { /* ignore */ }
      msg = msg ?? "Something went wrong. Please try again.";
    }
    setTurns((t) => {
      const copy = [...t];
      copy[copy.length - 1] = { request, result: error ? undefined : (data as Result), error: msg };
      return copy;
    });
    setBusy(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const q = params.get("q");
    if (q && !loading && !started.current) {
      started.current = true;
      setParams({}, { replace: true });
      ask(q);
    }
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const book = async (p: Provider, taskId: string | null) => {
    setBooking(p.id);
    try {
      const order = await placePointOrder(p.id);
      if (taskId) {
        await supabase.from("tasks").update({
          status: "booked", matched_provider_id: p.user_id, matched_service_id: p.id, booking_id: order.id,
        }).eq("id", taskId);
      }
      toast.success(`Booked ${p.title}`);
      navigate(`/chat/swap/${order.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBooking(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="AI Assistant — Service Swap" description="Tell the ServiceSwap AI what you need and it will find trusted local providers for you." canonical="/assistant" />
      <Navbar />
      <main className="container max-w-3xl flex-1 py-6 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl leading-tight">ServiceSwap Agent</h1>
            <p className="text-xs text-muted-foreground">Finds and compares trusted providers for you</p>
          </div>
        </div>

        {turns.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <p className="font-display text-xl">What do you need help with?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} onClick={() => ask(p)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {turns.map((t, i) => {
            const last = i === turns.length - 1;
            return (
              <div key={i} className="space-y-3">
                <div className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{t.request}</p>
                </div>

                {last && busy && (
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
                    {STEPS.map((s, idx) => (
                      <div key={s} className={`flex items-center gap-2 text-sm ${idx > step ? "text-muted-foreground/50" : ""}`}>
                        {idx < step ? <Check className="h-4 w-4 text-success" /> : idx === step ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4" />}
                        {s}
                      </div>
                    ))}
                  </div>
                )}

                {t.error && <p className="text-sm text-destructive">{t.error}</p>}

                {t.result && (
                  <div className="space-y-3">
                    <p className="text-sm">{t.result.reply}</p>
                    <p className="text-sm font-semibold">
                      {t.result.providers.length
                        ? `I found ${t.result.providers.length} provider${t.result.providers.length > 1 ? "s" : ""} that match your request.`
                        : "I couldn't find a matching provider yet. Try different wording or browse all services."}
                    </p>
                    {t.result.providers.length === 0 && (
                      <Button asChild variant="outline" size="sm"><Link to="/explore">Browse services</Link></Button>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {t.result.providers.map((p) => {
                        const name = p.display_name ?? "Member";
                        return (
                          <article key={p.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col">
                            <div className="flex items-center gap-3">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                              ) : (
                                <div className="h-11 w-11 rounded-full bg-primary-soft flex items-center justify-center font-semibold text-primary">{name.charAt(0).toUpperCase()}</div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold truncate flex items-center gap-1">
                                  {name}
                                  {p.trust_score >= 80 && <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-label="Trusted" />}
                                </p>
                                <p className="text-[11px] uppercase tracking-wider text-primary">{p.category}</p>
                              </div>
                            </div>
                            <h3 className="mt-3 font-display text-lg leading-snug">{p.title}</h3>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city_name ?? (p.delivery_type === "online" ? "Online" : "—")}</span>
                              <span>Trust {p.trust_score}</span>
                              <span className="font-semibold text-foreground">{p.point_price} pts</span>
                            </div>
                            <div className="mt-3 rounded-xl bg-muted/50 p-3">
                              <p className="text-[11px] font-semibold mb-1">Why this provider?</p>
                              <ul className="space-y-0.5">
                                {p.reasons.slice(0, 4).map((r) => (
                                  <li key={r} className="flex items-center gap-1.5 text-xs"><Check className="h-3 w-3 text-success" />{r}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3 flex gap-2 mt-auto pt-3">
                              <Button size="sm" className="flex-1" disabled={booking === p.id} onClick={() => book(p, t.result!.task_id)}>
                                {booking === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book now"}
                              </Button>
                              <Button size="sm" variant="outline" asChild className="flex-1"><Link to="/explore">View profile</Link></Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <div className="sticky bottom-0 bg-background/90 backdrop-blur border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="container max-w-3xl py-3 flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            rows={1}
            placeholder="I need someone to clean my apartment in Surrey tomorrow afternoon."
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-full shrink-0" disabled={busy || !input.trim()} aria-label="Send">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Assistant;
