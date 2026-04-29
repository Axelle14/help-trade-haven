import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import sarahImg from "@/assets/avatars/sarah.jpg";
import marcusImg from "@/assets/avatars/marcus.jpg";
import priyaImg from "@/assets/avatars/priya.jpg";
import jordanImg from "@/assets/avatars/jordan.jpg";
import elenaImg from "@/assets/avatars/elena.jpg";
import devonImg from "@/assets/avatars/devon.jpg";

const creators = [
  { name: "Sarah Chen", skill: "Math Tutor", rating: 4.9, swaps: 38, photo: sarahImg },
  { name: "Marcus Rivera", skill: "Brand Designer", rating: 4.8, swaps: 24, photo: marcusImg },
  { name: "Priya Sharma", skill: "Resume Coach", rating: 4.7, swaps: 51, photo: priyaImg },
  { name: "Jordan MacLeod", skill: "Fitness Coach", rating: 5.0, swaps: 19, photo: jordanImg },
  { name: "Elena Vasquez", skill: "Spanish Tutor", rating: 4.9, swaps: 27, photo: elenaImg },
  { name: "Devon Park", skill: "Senior Developer", rating: 5.0, swaps: 12, photo: devonImg },
];

const FeaturedCreators = () => (
  <section className="container py-10 md:py-14">
    <div className="flex items-end justify-between mb-5 md:mb-7">
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Featured creators</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Top in your city</h2>
      </div>
    </div>

    <div className="overflow-x-auto md:overflow-visible no-scrollbar -mx-4 px-4">
      <div className="grid grid-flow-col auto-cols-[calc((100%-0.75rem)/2)] sm:auto-cols-[160px] md:auto-cols-[200px] gap-3 md:gap-4 pb-2">
        {creators.map((c, i) => (
          <motion.article
            key={c.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
            className="rounded-3xl bg-card border border-border/50 shadow-soft p-3 md:p-4 tap-scale hover:shadow-card transition-smooth"
          >
            <img
              src={c.photo}
              alt={c.name}
              loading="lazy"
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-cover shadow-soft mb-3"
            />
            <div className="flex items-center gap-1 mb-0.5">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate">{c.skill}</p>
            <div className="flex items-center justify-between mt-3 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {c.rating}
              </span>
              <span className="text-muted-foreground">{c.swaps} swaps</span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedCreators;
