import { ShieldCheck, BadgeCheck, MessageCircle, Lock, Star, AlertCircle } from "lucide-react";

const pillars = [
  {
    icon: BadgeCheck,
    title: "Verified profiles",
    desc: "Every member confirms their identity and city before they can list or book.",
  },
  {
    icon: Star,
    title: "Community trust scores",
    desc: "Real ratings from real swaps. Your reputation is earned, not bought.",
  },
  {
    icon: Lock,
    title: "Points held in escrow",
    desc: "Points are locked at booking and only released when both sides confirm.",
  },
  {
    icon: MessageCircle,
    title: "In-app messaging",
    desc: "Coordinate safely without sharing personal contact details upfront.",
  },
  {
    icon: AlertCircle,
    title: "Report & appeal",
    desc: "Flag bad actors instantly. Our moderation team reviews every case.",
  },
  {
    icon: ShieldCheck,
    title: "Local-first matching",
    desc: "In-person services are matched within your city for safer, faster meetups.",
  },
];

const TrustSafety = () => {
  return (
    <section id="trust" className="container py-12 md:py-16">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Trust & safety</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 leading-[1.1]">
          Built for real <span className="text-primary">human trust.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          We designed Service Swap so you can confidently swap with strangers — without the awkwardness or the risk.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="bg-card rounded-3xl p-6 shadow-soft border border-foreground/5 hover:shadow-card transition-smooth"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <p.icon className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSafety;
