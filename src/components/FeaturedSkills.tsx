import { motion } from "framer-motion";
import { BadgeCheck, Star, Coins, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const skills = [
  { name: "Emma", skill: "Math Tutoring", city: "Vancouver", rating: 4.9, points: 25, initials: "E", from: "hsl(252 100% 65%)", to: "hsl(280 80% 70%)" },
  { name: "Daniel", skill: "Logo Design", city: "Surrey", rating: 4.8, points: 40, initials: "D", from: "hsl(16 90% 65%)", to: "hsl(38 95% 65%)" },
  { name: "Chloe", skill: "Piano Lessons", city: "Burnaby", rating: 5.0, points: 30, initials: "C", from: "hsl(320 75% 65%)", to: "hsl(0 80% 70%)" },
  { name: "Amir", skill: "Coding Help", city: "Vancouver", rating: 4.9, points: 50, initials: "A", from: "hsl(190 80% 55%)", to: "hsl(252 100% 65%)" },
];

const FeaturedSkills = () => (
  <section className="container py-12 md:py-16">
    <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-2">Marketplace</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
          Featured skills <span className="text-primary">near you</span>
        </h2>
      </div>
      <a href="#explore" className="text-sm font-semibold text-primary hover:underline">View all →</a>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {skills.map((s, i) => (
        <div key={`${s.name}-wrap`} className={i >= 2 ? "hidden sm:contents" : "contents"}>
        </div> && null || null
      ))}
      {skills.map((s, i) => (
        <motion.article
          key={s.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.06, duration: 0.45 }}
          className="group rounded-3xl bg-card border border-border/50 shadow-soft p-5 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-bold shadow-soft"
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
            >
              {s.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm truncate">{s.name}</p>
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {s.rating}
              </span>
            </div>
          </div>

          <h3 className="font-display font-bold text-lg leading-tight mb-1">{s.skill}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <MapPin className="w-3 h-3" />
            {s.city}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="flex items-center gap-1 font-display font-bold text-base">
              <Coins className="w-4 h-4 text-primary" />
              {s.points}
              <span className="text-xs font-medium text-muted-foreground ml-0.5">pts</span>
            </span>
            <Button size="sm" className="rounded-full h-8 px-4 text-xs">Book Now</Button>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default FeaturedSkills;
