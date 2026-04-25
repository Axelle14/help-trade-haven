import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Trophy, Crown, Gift, Copy, Check, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { BADGES, POINT_RULES, getProgress, generateReferralCode, type BadgeTier } from "@/lib/rewards";

const TIER_ICONS: Record<BadgeTier, typeof Sparkles> = {
  Beginner: Sparkles,
  Trusted: ShieldCheck,
  Expert: Trophy,
  Legend: Crown,
};

const TIER_GRADIENTS: Record<BadgeTier, string> = {
  Beginner: "from-accent to-warning",
  Trusted: "from-primary to-accent",
  Expert: "from-primary to-primary-glow",
  Legend: "from-primary-glow to-accent",
};

// Demo: in production this would come from the user's profile
const DEMO_POINTS = 1240;
const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const earnActions = [
  { action: "Complete a swap", points: POINT_RULES.COMPLETE_SWAP },
  { action: "Receive a 5★ review", points: POINT_RULES.FIVE_STAR_REVIEW },
  { action: "Refer a friend who joins", points: POINT_RULES.REFERRAL_SIGNUP },
  { action: "Friend completes first swap", points: POINT_RULES.REFERRAL_FIRST_SWAP },
  { action: "Verify your identity", points: POINT_RULES.VERIFY_IDENTITY },
  { action: "Complete your profile", points: POINT_RULES.PROFILE_COMPLETE },
];

const Rewards = () => {
  const [copied, setCopied] = useState(false);
  const progress = useMemo(() => getProgress(DEMO_POINTS), []);
  const referralCode = useMemo(() => generateReferralCode(DEMO_USER_ID), []);

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Referral code copied!", description: "Share it with friends to earn 150 pts each." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="rewards" className="container py-24 md:py-32">
      {/* Hero progress card */}
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-8 md:p-14 shadow-float mb-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)",
          }}
        />

        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">Rewards</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-5">
              Every swap earns you points.
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed max-w-md">
              Climb the ranks, unlock perks, and grow your reputation. The more you give back, the more the community gives you.
            </p>
            <Button variant="outline" size="lg" className="bg-card/95 hover:bg-card border-0 text-foreground">
              View your rewards
            </Button>
          </div>

          {/* Progress panel */}
          <Card className="bg-card/95 backdrop-blur-sm border-0 rounded-3xl p-6 md:p-8 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Your tier
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-2xl">{progress.current.tier}</h3>
                  <Badge variant="secondary" className="rounded-full">
                    {DEMO_POINTS.toLocaleString()} pts
                  </Badge>
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TIER_GRADIENTS[progress.current.tier]} flex items-center justify-center shadow-soft`}
              >
                {(() => {
                  const Icon = TIER_ICONS[progress.current.tier];
                  return <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />;
                })()}
              </div>
            </div>

            <Progress value={progress.percent} className="h-3 mb-3" />

            {progress.next ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{progress.pointsForNext.toLocaleString()} pts</span> to{" "}
                <span className="font-semibold text-primary">{progress.next.tier}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">You've reached the top tier 👑</p>
            )}

            <div className="mt-6 pt-6 border-t border-border/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Current perks
              </p>
              <ul className="space-y-2">
                {progress.current.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Badge tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {BADGES.map((badge, i) => {
          const Icon = TIER_ICONS[badge.tier];
          const isCurrent = badge.tier === progress.current.tier;
          return (
            <motion.div
              key={badge.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`rounded-3xl p-6 h-full transition-smooth hover:-translate-y-1 ${
                  isCurrent ? "border-primary border-2 shadow-glow" : "shadow-card"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TIER_GRADIENTS[badge.tier]} flex items-center justify-center mb-4 shadow-soft`}
                >
                  <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-bold text-lg">{badge.tier}</p>
                  {isCurrent && (
                    <Badge variant="default" className="rounded-full text-[10px] px-2 py-0">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {badge.minPoints.toLocaleString()}
                  {badge.maxPoints ? `–${badge.maxPoints.toLocaleString()}` : "+"} pts
                </p>
                <p className="text-xs text-foreground/80 leading-relaxed">{badge.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Earn + Referral */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="rounded-3xl p-6 md:p-8 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <h3 className="font-display font-bold text-xl">Ways to earn</h3>
          </div>
          <ul className="space-y-3">
            {earnActions.map((item) => (
              <li
                key={item.action}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-foreground/90">{item.action}</span>
                <Badge variant="secondary" className="rounded-full font-semibold">
                  +{item.points} pts
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-3xl p-6 md:p-8 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <h3 className="font-display font-bold text-xl">Refer & earn</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Invite friends to Service Swap. You'll earn{" "}
            <span className="font-semibold text-foreground">150 pts</span> when they sign up, plus{" "}
            <span className="font-semibold text-foreground">300 pts</span> when they finish their first swap.
          </p>

          <div className="flex items-center gap-2 p-3 bg-card rounded-2xl border-2 border-dashed border-primary/30 mb-4">
            <code className="flex-1 font-mono text-sm font-semibold text-primary px-2">{referralCode}</code>
            <Button size="sm" variant="soft" onClick={copyReferral} className="gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/80 rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-2xl text-primary">3</p>
              <p className="text-xs text-muted-foreground mt-1">Friends joined</p>
            </div>
            <div className="bg-card/80 rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-2xl text-primary">450</p>
              <p className="text-xs text-muted-foreground mt-1">Pts from referrals</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Rewards;
