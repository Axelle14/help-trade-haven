import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Placeholder pricing — payments are not connected yet.
export const PLANS = [
  {
    name: "Browse",
    price: "$0",
    period: "forever",
    features: ["Browse all listings", "See provider profiles", "Save favourites"],
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Member",
    price: "$4.99",
    period: "per month",
    features: [
      "Unlimited service swaps",
      "0% fees on every exchange",
      "List your own services",
      "Message & book providers",
      "100 starter points",
    ],
    cta: "Subscribe",
    highlight: true,
  },
];

const PricingSection = ({ showHeading = true }: { showHeading?: boolean }) => (
  <section id="pricing" className="container py-8 md:py-12">
    {showHeading && (
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl">Simple pricing. No service fees.</h2>
        <p className="mt-2 text-sm text-muted-foreground">Browse free. Subscribe to swap as much as you like.</p>
      </div>
    )}
    <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
      {PLANS.map((p) => (
        <div
          key={p.name}
          className={`rounded-3xl border bg-card p-6 md:p-8 ${p.highlight ? "border-primary shadow-glow" : "border-border"}`}
        >
          {p.highlight && (
            <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Most popular
            </span>
          )}
          <h3 className="font-display text-2xl">{p.name}</h3>
          <p className="mt-2">
            <span className="text-4xl font-bold">{p.price}</span>
            <span className="ml-1 text-sm text-muted-foreground">{p.period}</span>
          </p>
          <ul className="mt-5 space-y-2.5">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 w-full"
            variant={p.highlight ? "default" : "outline"}
            disabled={!p.highlight}
            onClick={() => toast("Subscriptions are coming soon!")}
          >
            {p.cta}
          </Button>
        </div>
      ))}
    </div>
  </section>
);

export default PricingSection;
