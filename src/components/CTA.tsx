import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat2 } from "lucide-react";

const CTA = () => {
  return (
    <section className="container pb-24 md:pb-32">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
          <Repeat2 className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-5 leading-[1.05]">
          Your skills are
          <br />
          someone's wishlist.
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join 50,000+ members building a kinder, more resourceful economy — one swap at a time.
        </p>
        <Button variant="hero" size="xl">
          Create your free profile
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-xs text-muted-foreground mt-5">No credit card. No fees. Ever.</p>
      </div>
    </section>
  );
};

export default CTA;
