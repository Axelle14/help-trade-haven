import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const trending = [
  { tag: "Logo Design", count: 24, delta: "+12%", g: "linear-gradient(135deg,#6C4BFF,#8A63FF)" },
  { tag: "Math Tutoring", count: 38, delta: "+18%", g: "linear-gradient(135deg,#10B981,#06B6D4)" },
  { tag: "Spanish", count: 17, delta: "+9%", g: "linear-gradient(135deg,#F59E0B,#F97316)" },
  { tag: "Fitness Coaching", count: 21, delta: "+22%", g: "linear-gradient(135deg,#EC4899,#8B5CF6)" },
];

const TrendingSkills = () => (
  <section className="container py-10 md:py-14">
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Trending</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">What's hot this week</h2>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {trending.map((t, i) => (
        <motion.div
          key={t.tag}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to="/explore"
            className="block rounded-3xl p-4 text-primary-foreground shadow-soft hover:shadow-float transition-smooth tap-scale relative overflow-hidden h-[120px]"
            style={{ background: t.g }}
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative flex flex-col h-full justify-between">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-4 h-4 opacity-80" />
                <ArrowUpRight className="w-4 h-4 opacity-80" />
              </div>
              <div>
                <p className="font-display font-bold text-lg leading-tight">{t.tag}</p>
                <p className="text-xs opacity-90 mt-1">{t.count} listings · {t.delta}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TrendingSkills;
