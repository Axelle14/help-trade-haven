import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, MapPin, Star, Sparkles, Repeat2, Flame, Users } from "lucide-react";
import { findMatchesWithFallback, WEIGHTS, TIER_META, type MatchTier, type TaggedMatch } from "@/lib/matching";
import { me, candidates } from "@/lib/sampleUsers";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ScoreBar = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div>
    <div className="flex justify-between text-[10px] font-semibold mb-1">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span>{Math.round(value * 100)}%</span>
    </div>
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-smooth`} style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

const Matches = () => {
  const matches = useMemo(() => findMatchesWithFallback(me, candidates, 6), []);
  const grouped = useMemo(() => {
    const order: MatchTier[] = ["perfect", "they-help-me", "i-help-them", "learning", "trending", "seed"];
    const map = new Map<MatchTier, TaggedMatch[]>();
    for (const m of matches) {
      const arr = map.get(m.tier) ?? [];
      arr.push(m);
      map.set(m.tier, arr);
    }
    return order.filter((t) => map.has(t)).map((t) => ({ tier: t, items: map.get(t)! }));
  }, [matches]);

  const tierBadgeClass: Record<MatchTier, string> = {
    perfect: "bg-gradient-to-r from-primary to-accent text-primary-foreground",
    "they-help-me": "bg-accent/15 text-accent",
    "i-help-them": "bg-success/15 text-success",
    learning: "bg-secondary text-foreground",
    trending: "bg-warning/15 text-warning",
    seed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <header className="container relative pt-10 pb-6 flex items-center gap-4">
        <Link to="/dashboard" className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">Matching engine</p>
          <h1 className="font-display font-bold text-xl leading-tight">Your top 5 matches</h1>
        </div>
      </header>

      {/* Algorithm explainer */}
      <section className="container relative">
        <div className="bg-card rounded-3xl p-5 shadow-soft border border-foreground/5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm">How we score matches</p>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Each candidate gets a 0–100 score combining mutual skill fit (do they have what you need <em>and</em> need what you offer?), location proximity, and reputation.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-background/60 rounded-2xl p-3">
              <p className="font-display font-bold text-lg text-primary">{WEIGHTS.mutualFit * 100}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Mutual fit</p>
            </div>
            <div className="bg-background/60 rounded-2xl p-3">
              <p className="font-display font-bold text-lg text-accent">{WEIGHTS.proximity * 100}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Proximity</p>
            </div>
            <div className="bg-background/60 rounded-2xl p-3">
              <p className="font-display font-bold text-lg text-success">{WEIGHTS.reputation * 100}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Reputation</p>
            </div>
          </div>
        </div>
      </section>

      {/* "Me" card */}
      <section className="container relative mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Matching for</p>
        <div className="bg-gradient-to-r from-card to-secondary/40 rounded-3xl p-5 shadow-soft border border-foreground/5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-bold shadow-soft"
            style={{ background: `linear-gradient(135deg, ${me.avatarFrom}, ${me.avatarTo})` }}
          >
            {me.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold">{me.name}</p>
            <p className="text-xs text-muted-foreground">
              Offers: {me.skillsOffered.join(", ")} · Wants: {me.skillsNeeded.join(", ")}
            </p>
          </div>
        </div>
      </section>

      {/* Matches list — grouped by tier */}
      <section className="container relative pb-16 space-y-10">
        {grouped.map(({ tier, items }) => {
          const meta = TIER_META[tier];
          const showMatchPercent = tier === "perfect";
          return (
            <div key={tier}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight flex items-center gap-2">
                    {tier === "trending" && <Flame className="w-4 h-4 text-warning" />}
                    {meta.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.blurb}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tierBadgeClass[tier]}`}>
                  {items.length}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((m, i) => (
                  <motion.article
                    key={m.user.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-3xl p-6 shadow-card border border-foreground/5 relative overflow-hidden"
                  >
                    <div className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tierBadgeClass[tier]}`}>
                      {tier === "perfect" ? "Perfect match" : tier === "they-help-me" ? "Half match" : tier === "i-help-them" ? "Earn rep" : tier === "learning" ? "Learning" : tier === "trending" ? "Trending" : "Featured"}
                    </div>

                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft shrink-0"
                          style={{ background: `linear-gradient(135deg, ${m.user.avatarFrom}, ${m.user.avatarTo})` }}
                        >
                          {m.user.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold truncate">{m.user.name}</p>
                            {m.user.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              {m.user.rating} ({m.user.reviews})
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {m.user.city}
                            </span>
                          </div>
                        </div>
                      </div>
                      {showMatchPercent && (
                        <div className="text-right shrink-0 mt-6">
                          <p className="font-display font-bold text-3xl text-primary leading-none">{m.matchPercent}%</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">match</p>
                        </div>
                      )}
                    </div>

                    {/* Swap visualization */}
                    <div className="bg-background/60 rounded-2xl p-4 mb-5 grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="font-bold uppercase tracking-wider text-success text-[10px]">They give you</span>
                        </div>
                        {m.theyOffer.length ? (
                          <div className="flex flex-wrap gap-1">
                            {m.theyOffer.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">{s}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {m.user.skillsOffered.slice(0, 2).map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Repeat2 className="w-3 h-3 text-primary" />
                          <span className="font-bold uppercase tracking-wider text-accent text-[10px]">You give them</span>
                        </div>
                        {m.iOffer.length ? (
                          <div className="flex flex-wrap gap-1">
                            {m.iOffer.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">{s}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Pitch them something they'd want</span>
                        )}
                      </div>
                    </div>

                    {/* Score breakdown — only for perfect matches */}
                    {showMatchPercent && (
                      <div className="space-y-3 mb-5">
                        <ScoreBar value={m.breakdown.mutualFit} label="Mutual fit" color="gradient-primary" />
                        <ScoreBar value={m.breakdown.proximity} label={`Proximity · ${Math.round(m.breakdown.distanceKm)} km`} color="bg-accent" />
                        <ScoreBar value={m.breakdown.reputation} label="Reputation" color="bg-success" />
                      </div>
                    )}

                    <Button className="w-full" variant={showMatchPercent ? "default" : "secondary"}>
                      {meta.cta}
                    </Button>
                  </motion.article>
                ))}
              </div>
            </div>
          );
        })}

        {/* Always-on safety net */}
        <div className="bg-gradient-to-br from-secondary to-card rounded-3xl p-6 border border-dashed border-foreground/10 text-center">
          <p className="font-display font-bold text-lg mb-1">Don't see what you need?</p>
          <p className="text-sm text-muted-foreground mb-4">Post a skill request — we'll alert you the moment someone joins who can help.</p>
          <Button variant="outline">Request a skill</Button>
        </div>
      </section>
    </div>
  );
};

export default Matches;
