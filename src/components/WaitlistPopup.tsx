import { useEffect, useState } from "react";
import { z } from "zod";
import { Sparkles, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "ss_waitlist_dismissed_v1";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  referral: z.string().trim().max(40).optional(),
});

const WaitlistPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setOpen(true);
    };

    const delay = window.setTimeout(trigger, 25000);

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total > 0.55) trigger();
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.clearTimeout(delay);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = schema.safeParse({ email, referral: referral || undefined });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    // Simulated submit — wire to backend later
    setTimeout(() => {
      setSubmitting(false);
      dismiss();
      toast({
        title: "You're on the list! 🎉",
        description: "We'll email you 25 bonus points the moment we launch in your city.",
      });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(v) : dismiss())}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 rounded-3xl">
        <div className="gradient-primary px-6 pt-6 pb-5 text-primary-foreground relative">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[11px] font-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            Early access
          </div>
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="font-display font-bold text-2xl md:text-3xl tracking-tight leading-tight text-primary-foreground">
              Get free points for joining early
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85 text-sm leading-relaxed">
              Join Service Swap today and invite friends to earn bonus points when we launch in your city.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3 bg-card">
          <div className="flex items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm">
            <Gift className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold">Get 25 bonus points + 10 per referral</span>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
              className="h-11 rounded-xl"
              aria-label="Email"
            />
            <Input
              type="text"
              placeholder="Referral code (optional)"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              maxLength={40}
              className="h-11 rounded-xl"
              aria-label="Referral code"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" disabled={submitting} className="h-11 rounded-xl text-sm font-semibold">
              {submitting ? "Joining…" : "Join Waitlist"}
            </Button>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;
