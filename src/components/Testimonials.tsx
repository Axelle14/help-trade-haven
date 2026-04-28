import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I traded a logo for 6 months of Spanish tutoring. I'd never have paid cash for either — Service Swap unlocked both.",
    name: "Maya C.",
    city: "Vancouver",
    initials: "MC",
    from: "hsl(250 80% 65%)",
    to: "hsl(280 80% 70%)",
  },
  {
    quote:
      "Got my apartment shelves built by a neighbour for points I earned tutoring math. Felt like a real community for the first time.",
    name: "Jordan R.",
    city: "Surrey",
    initials: "JR",
    from: "hsl(16 90% 65%)",
    to: "hsl(38 95% 65%)",
  },
  {
    quote:
      "Booked yoga, photo edits, and a haircut all in my first week. The 100 starter points hooked me — the people kept me.",
    name: "Aisha N.",
    city: "Burnaby",
    initials: "AN",
    from: "hsl(320 75% 65%)",
    to: "hsl(0 80% 70%)",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12 text-center mx-auto">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Loved by neighbours</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 leading-[1.1]">
          Stories from your <span className="text-primary">BC community.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-card rounded-3xl p-7 shadow-soft border border-foreground/5 flex flex-col"
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-warning text-warning" />
              ))}
            </div>
            <p className="text-base text-foreground/90 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city}, BC</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
