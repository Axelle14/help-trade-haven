import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp, Users } from "lucide-react";

const cities = [
  { name: "Vancouver", listings: 420, swaps: 180, emoji: "🌆" },
  { name: "Surrey", listings: 310, swaps: 140, emoji: "🌳" },
  { name: "Burnaby", listings: 245, swaps: 110, emoji: "🏙️" },
  { name: "Richmond", listings: 198, swaps: 92, emoji: "🌊" },
  { name: "Coquitlam", listings: 162, swaps: 78, emoji: "🏞️" },
  { name: "Langley", listings: 134, swaps: 61, emoji: "🌾" },
];

const PopularInBC = () => {
  const [active, setActive] = useState(cities[0].name);
  const current = cities.find((c) => c.name === active)!;

  return (
    <section className="container py-12 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-2">Local discovery</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight mb-3">
          Popular in <span className="text-primary">British Columbia</span>
        </h2>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Explore active swap communities in your city.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
        {cities.map((c) => {
          const isActive = c.name === active;
          return (
            <button
              key={c.name}
              onClick={() => setActive(c.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                isActive
                  ? "gradient-primary text-primary-foreground border-transparent shadow-glow scale-105"
                  : "bg-card border-border/60 hover:border-primary/40 hover:-translate-y-0.5"
              }`}
            >
              <span>{c.emoji}</span>
              {c.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl mx-auto rounded-3xl bg-card border border-border/50 shadow-card p-6 md:p-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{current.name}, BC</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-2xl bg-primary-soft p-5">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="font-display font-bold text-3xl md:text-4xl tracking-tight">{current.listings}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Active listings</p>
            </div>
            <div className="rounded-2xl bg-success/10 p-5">
              <TrendingUp className="w-5 h-5 text-success mb-2" />
              <p className="font-display font-bold text-3xl md:text-4xl tracking-tight">{current.swaps}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Swaps this month</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default PopularInBC;
