import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, Users, TrendingUp, ArrowRight, ArrowLeft, MapPin,
  Check, Copy, Share2, PartyPopper, Flame,
} from "lucide-react";
import {
  joinWaitlist, momentumMembers, momentumSwaps,
  trackEvent, buildInviteLink, getReferralProgress,
  type WaitlistEntry,
} from "@/lib/waitlist";
import type { CityWithStats } from "@/lib/communities";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cities: CityWithStats[];
  preselectedCityId?: string | null;
  referralCode?: string | null;
}

type Step = "city" | "form" | "success";

export const JoinCityFunnel = ({ open, onOpenChange, cities, preselectedCityId, referralCode }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("city");
  const [selectedCity, setSelectedCity] = useState<CityWithStats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [referrals, setReferrals] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", skill_offered: "", skill_needed: "",
  });

  // Reset & preselect when modal opens
  useEffect(() => {
    if (!open) return;
    trackEvent("waitlist_funnel_opened", { referral: !!referralCode });
    if (preselectedCityId) {
      const c = cities.find((x) => x.id === preselectedCityId);
      if (c) { setSelectedCity(c); setStep("form"); return; }
    }
    setStep("city");
    setSelectedCity(null);
    setEntry(null);
  }, [open, preselectedCityId, cities, referralCode]);

  // Poll referral progress on success step
  useEffect(() => {
    if (step !== "success" || !entry) return;
    let alive = true;
    const tick = async () => {
      const n = await getReferralProgress(entry.referral_code).catch(() => 0);
      if (alive) setReferrals(n);
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => { alive = false; clearInterval(id); };
  }, [step, entry]);

  const inviteLink = useMemo(
    () => entry && selectedCity ? buildInviteLink(entry.referral_code, selectedCity.slug) : "",
    [entry, selectedCity]
  );

  const pickCity = (c: CityWithStats) => {
    trackEvent("waitlist_city_selected", { city: c.slug });
    setSelectedCity(c);
    setStep("form");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    if (!form.name.trim() || !form.email.trim() || !form.skill_offered.trim() || !form.skill_needed.trim()) {
      toast({ title: "Almost there", description: "Please fill in name, email, and your skills.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await joinWaitlist({
        city_id: selectedCity.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        skill_offered: form.skill_offered,
        skill_needed: form.skill_needed,
        referred_by_code: referralCode ?? null,
      });
      trackEvent("waitlist_signup_completed", { city: selectedCity.slug, referred: !!referralCode });
      setEntry(result);
      setStep("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const friendly = msg.includes("city_waitlist_email_city_unique")
        ? "You're already on the list for this city — check your inbox!"
        : msg;
      toast({ title: "Couldn't reserve your spot", description: friendly, variant: "destructive" });
      trackEvent("waitlist_signup_failed", { city: selectedCity.slug, error: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast({ title: "Invite link copied", description: "Share it with 3 friends to unlock the Founder Badge." });
    trackEvent("waitlist_invite_copied", { city: selectedCity?.slug });
  };

  const shareNative = async () => {
    if (!inviteLink || !selectedCity) return;
    trackEvent("waitlist_invite_shared", { city: selectedCity.slug });
    const data = {
      title: `Join the ${selectedCity.name} Service Swap community`,
      text: `I just joined Service Swap in ${selectedCity.name} — trade skills, no money. Join with my link:`,
      url: inviteLink,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share(data); return; } catch { /* fall through */ }
    }
    copyLink();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-0 rounded-3xl shadow-float"
        style={{ background: "#f6e8e1" }}
      >
        {/* STEP 1 — CITY SELECT */}
        {step === "city" && (
          <div className="p-6 sm:p-8">
            <DialogHeader>
              <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-0 rounded-full mb-2">
                <MapPin className="w-3 h-3 mr-1.5" /> Step 1 of 3
              </Badge>
              <DialogTitle className="font-display text-3xl sm:text-4xl tracking-tight">
                Pick your <span className="text-primary">BC city</span>
              </DialogTitle>
              <DialogDescription className="text-base">
                Service Swap is launching city by city. Join your local crew before spots fill up.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {cities.map((c) => {
                const members = momentumMembers(c.slug, c.member_count);
                const swaps = momentumSwaps(c.slug, c.stats?.swaps_completed ?? 0);
                const hot = members > 100;
                return (
                  <button
                    key={c.id}
                    onClick={() => pickCity(c)}
                    className="group text-left rounded-2xl bg-card border border-foreground/10 p-4 hover:border-primary hover:shadow-card transition-smooth flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg truncate">{c.name}</span>
                        {hot && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent uppercase tracking-wider">
                            <Flame className="w-3 h-3" /> Hot
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{members}</span>
                        <span className="inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" />{swaps}/mo</span>
                      </div>
                    </div>
                    <Button size="sm" variant="hero" className="shrink-0 rounded-full">
                      Join <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              🇨🇦 Launching across British Columbia · More provinces soon
            </p>
          </div>
        )}

        {/* STEP 2 — FORM */}
        {step === "form" && selectedCity && (
          <div className="p-6 sm:p-8">
            <DialogHeader>
              <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-0 rounded-full mb-2">
                <Sparkles className="w-3 h-3 mr-1.5" /> Step 2 of 3
              </Badge>
              <DialogTitle className="font-display text-3xl sm:text-4xl tracking-tight">
                Join the <span className="text-primary">{selectedCity.name}</span> community
              </DialogTitle>
              <DialogDescription className="text-base">
                {momentumMembers(selectedCity.slug, selectedCity.member_count)} neighbors already in.
                Reserve your spot — it's free.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="mt-5 grid gap-3.5">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label htmlFor="wl-name">Name *</Label>
                  <Input id="wl-name" required maxLength={100} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-card rounded-xl h-11" placeholder="Your name" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="wl-email">Email *</Label>
                  <Input id="wl-email" type="email" required maxLength={255} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-card rounded-xl h-11" placeholder="you@email.com" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="wl-offer">What skill can you offer? *</Label>
                <Input id="wl-offer" required maxLength={200} value={form.skill_offered}
                  onChange={(e) => setForm({ ...form, skill_offered: e.target.value })}
                  className="bg-card rounded-xl h-11" placeholder="e.g. Web design, guitar lessons, dog walking" />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="wl-need">What skill do you need? *</Label>
                <Input id="wl-need" required maxLength={200} value={form.skill_needed}
                  onChange={(e) => setForm({ ...form, skill_needed: e.target.value })}
                  className="bg-card rounded-xl h-11" placeholder="e.g. Photography, French tutoring, plumbing" />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="wl-phone" className="flex items-center justify-between">
                  Phone <span className="text-xs text-muted-foreground font-normal">Optional</span>
                </Label>
                <Input id="wl-phone" type="tel" maxLength={30} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-card rounded-xl h-11" placeholder="+1 (___) ___-____" />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep("city")} className="rounded-full">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="submit" variant="hero" size="lg" disabled={submitting} className="rounded-full px-8">
                  {submitting ? "Reserving…" : <>Reserve My Spot <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                We'll never share your info. Unsubscribe anytime.
              </p>
            </form>
          </div>
        )}

        {/* STEP 3 — SUCCESS / REFERRAL */}
        {step === "success" && selectedCity && entry && (
          <div className="p-6 sm:p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-glow">
              <PartyPopper className="w-8 h-8" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl sm:text-4xl tracking-tight text-center">
                You're in 🎉
              </DialogTitle>
              <DialogDescription className="text-base text-center">
                Welcome to <span className="font-semibold text-foreground">{selectedCity.name}</span>.
                You're #{momentumMembers(selectedCity.slug, selectedCity.member_count) + 1} on the list.
              </DialogDescription>
            </DialogHeader>

            {/* Founder Badge progress */}
            <div className="mt-6 rounded-2xl bg-card border border-foreground/10 p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold">Unlock the Founder Badge</span>
                <Badge className="bg-primary/10 text-primary border-0 rounded-full">
                  {Math.min(referrals, 3)}/3
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Invite 3 friends in {selectedCity.name} to claim your permanent Founder Badge — visible on your profile forever.
              </p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (referrals / 3) * 100)}%` }}
                />
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                <span className="text-xs font-mono truncate flex-1">{inviteLink}</span>
                <Button size="sm" variant="ghost" onClick={copyLink} className="shrink-0 h-8">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button variant="hero" size="lg" onClick={shareNative} className="rounded-full">
                <Share2 className="w-4 h-4" /> Share Invite Link
              </Button>
              <Button variant="outline" size="lg" className="rounded-full"
                onClick={() => {
                  trackEvent("waitlist_explore_after_signup", { city: selectedCity.slug });
                  onOpenChange(false);
                  navigate(`/communities/${selectedCity.slug}`);
                }}>
                Explore Community <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-primary" />
              We sent a confirmation to <span className="font-semibold text-foreground">{entry.email}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
