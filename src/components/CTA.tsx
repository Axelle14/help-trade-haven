import { Button } from "@/components/ui/button";
import { ArrowRight, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="container pb-10 md:pb-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
          <Coins className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-5 leading-[1.05]">
          100 points are
          <br />
          waiting for you.
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join Service Swap, claim your starter points, and book your first local skill in minutes.
        </p>
        <Button asChild variant="hero" size="xl">
          <Link to="/auth">
            Claim 100 free points
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-5">No credit card. No fees. Points only.</p>
      </div>
    </section>
  );
};

export default CTA;
