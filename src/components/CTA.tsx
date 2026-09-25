import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => (
  <section className="container pb-8">
    <div className="rounded-3xl gradient-primary text-primary-foreground p-8 md:p-12 text-center">
      <h2 className="font-display text-3xl md:text-4xl leading-tight">Swap unlimited services for $4.99/month.</h2>
      <p className="mt-2 text-sm opacity-90">No per-order fees. Cancel anytime.</p>
      <Button asChild variant="secondary" className="mt-5">
        <Link to="/pricing">See plans <ArrowRight className="w-4 h-4" /></Link>
      </Button>
    </div>
  </section>
);

export default CTA;
