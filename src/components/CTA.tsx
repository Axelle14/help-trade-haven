import { Button } from "@/components/ui/button";
import { ArrowRight, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="container pb-6 md:pb-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-10 h-10 rounded-2xl gradient-primary mx-auto mb-3 flex items-center justify-center shadow-glow">
          <Coins className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-2 leading-tight">
          100 points are waiting for you.
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Join Service Swap, claim your starter points, and book your first local skill in minutes.
        </p>
        <Button asChild variant="hero" size="default">
          <Link to="/auth">
            Claim 100 free points
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">No credit card. No fees. Points only.</p>
      </div>
    </section>
  );
};

export default CTA;
