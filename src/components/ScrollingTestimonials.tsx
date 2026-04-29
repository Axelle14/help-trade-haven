import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { quote: "I traded coding help for French lessons.", name: "Maya", city: "Vancouver", initials: "M", from: "hsl(252 100% 65%)", to: "hsl(280 80% 70%)" },
  { quote: "Booked a fitness coach using points. So easy.", name: "Jordan", city: "Surrey", initials: "J", from: "hsl(16 90% 65%)", to: "hsl(38 95% 65%)" },
  { quote: "Finally a platform built for real local skills.", name: "Sarah", city: "Burnaby", initials: "S", from: "hsl(320 75% 65%)", to: "hsl(0 80% 70%)" },
  { quote: "I earned points teaching piano and used them for logo design.", name: "Kevin", city: "Richmond", initials: "K", from: "hsl(190 80% 55%)", to: "hsl(252 100% 65%)" },
  { quote: "Met three neighbours in my first week. Real community.", name: "Aisha", city: "Coquitlam", initials: "A", from: "hsl(160 70% 50%)", to: "hsl(190 80% 60%)" },
  { quote: "Swapped resume edits for guitar lessons. Brilliant.", name: "Noah", city: "Langley", initials: "N", from: "hsl(38 95% 60%)", to: "hsl(16 90% 65%)" },
];

const Card = ({ t }: { t: typeof testimonials[number] }) => (
  <div className="shrink-0 w-[300px] md:w-[360px] mx-3 rounded-3xl glass border border-white/60 shadow-soft p-6 backdrop-blur-xl">
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-4 h-4 fill-warning text-warning" />
      ))}
    </div>
    <p className="text-base text-foreground/90 leading-relaxed mb-5">"{t.quote}"</p>
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0"
        style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
      >
        {t.initials}
      </div>
      <div>
        <p className="font-semibold text-sm">{t.name}</p>
        <p className="text-xs text-muted-foreground">{t.city}, BC</p>
      </div>
    </div>
  </div>
);

const ScrollingTestimonials = () => {
  const loop = [...testimonials, ...testimonials];
  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container mb-8 md:mb-10 text-center">
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-2">Loved across BC</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
          Real swaps. <span className="text-primary">Real neighbours.</span>
        </h2>
      </div>

      <div
        className="group relative"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          style={{ animationPlayState: "running" }}
        >
          <div className="flex group-hover:[animation-play-state:paused]" style={{ animationPlayState: "running" }}>
            {loop.map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollingTestimonials;
