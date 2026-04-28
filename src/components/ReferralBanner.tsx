import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ReferralBanner = () => {
  return (
    <section className="container pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-card border border-foreground/5 shadow-card p-8 md:p-12">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-8 items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" strokeWidth={2.2} />
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Refer a friend</p>
            <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-2">
              Earn <span className="text-primary">450 points</span> for every friend who joins.
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              150 pts when they sign up · 300 pts when they finish their first swap. No cap.
            </p>
          </div>

          <Button asChild variant="hero" size="lg" className="shrink-0 w-full md:w-auto">
            <Link to="/auth">
              Get my referral code
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReferralBanner;
