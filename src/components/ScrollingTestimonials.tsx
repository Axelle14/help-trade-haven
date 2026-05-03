import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  quote: string;
  name: string;
  city: string;
  rating: number;
  initials: string;
  from: string;
  to: string;
}

const GRADIENT_PAIRS = [
  { from: "hsl(252 100% 65%)", to: "hsl(280 80% 70%)" },
  { from: "hsl(16 90% 65%)", to: "hsl(38 95% 65%)" },
  { from: "hsl(320 75% 65%)", to: "hsl(0 80% 70%)" },
  { from: "hsl(190 80% 55%)", to: "hsl(252 100% 65%)" },
  { from: "hsl(160 70% 50%)", to: "hsl(190 80% 60%)" },
  { from: "hsl(38 95% 60%)", to: "hsl(16 90% 65%)" },
];

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  { quote: "I traded coding help for French lessons.", name: "Maya", city: "Vancouver", rating: 5, initials: "M", ...GRADIENT_PAIRS[0] },
  { quote: "Booked a fitness coach using points. So easy.", name: "Jordan", city: "Surrey", rating: 5, initials: "J", ...GRADIENT_PAIRS[1] },
  { quote: "Finally a platform built for real local skills.", name: "Sarah", city: "Burnaby", rating: 5, initials: "S", ...GRADIENT_PAIRS[2] },
  { quote: "I earned points teaching piano and used them for logo design.", name: "Kevin", city: "Richmond", rating: 5, initials: "K", ...GRADIENT_PAIRS[3] },
  { quote: "Met three neighbours in my first week. Real community.", name: "Aisha", city: "Coquitlam", rating: 5, initials: "A", ...GRADIENT_PAIRS[4] },
  { quote: "Swapped resume edits for guitar lessons. Brilliant.", name: "Noah", city: "Langley", rating: 5, initials: "N", ...GRADIENT_PAIRS[5] },
];

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const Card = ({ t }: { t: Testimonial }) => (
  <div className="shrink-0 w-[300px] md:w-[360px] mx-3 rounded-3xl glass border border-white/60 shadow-soft p-6 backdrop-blur-xl">
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
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
        {t.city && <p className="text-xs text-muted-foreground">{t.city}</p>}
      </div>
    </div>
  </div>
);

const ScrollingTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(PLACEHOLDER_TESTIMONIALS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating, comment, reviewer_id")
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cancelled || error || !reviews || reviews.length === 0) return;

      const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", reviewerIds);

      if (cancelled) return;
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

      const real: Testimonial[] = reviews
        .filter((r) => r.comment && r.comment.trim().length > 0)
        .map((r, i) => {
          const name = profileMap.get(r.reviewer_id) ?? "Member";
          const gradient = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
          return {
            quote: r.comment!,
            name,
            city: "",
            rating: r.rating,
            initials: initialsOf(name),
            ...gradient,
          };
        });

      if (real.length > 0 && !cancelled) {
        setTestimonials(real);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loop = [...testimonials, ...testimonials];

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container mb-8 md:mb-10 text-center">
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-2">Loved across BC</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
          Swaps <span className="text-primary">Reviews</span>
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
