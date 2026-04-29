import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ReferralBanner = () => {
  return (
    <section className="container pb-8 md:pb-12">
      <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-card border border-foreground/5 shadow-card p-5 md:p-12">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-3 md:gap-8 items-center">
          <div className="w-11 h-11 md:w-20 md:h-20 rounded-2xl md:rounded-3xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Gift className="w-5 h-5 md:w-10 md:h-10 text-primary-foreground" strokeWidth={2.2} />
          </div>

          <div>
            <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider mb-1 md:mb-2">Refer a friend</p>
            <h3 className="font-display font-bold text-lg md:text-3xl leading-tight mb-1 md:mb-2">
              Earn <span className="text-primary">50 points</span> for every friend who joins.
            </h3>
            <p className="text-xs md:text-base text-muted-foreground">
              20 pts when they sign up · 30 pts when they finish their first swap. No cap.
            </p>
          </div>

          <Button asChild size="default" className="shrink-0 w-full md:w-auto md:h-12 md:px-8 md:text-base bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow">
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
