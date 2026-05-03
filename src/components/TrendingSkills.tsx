import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TrendingItem {
  tag: string;
  count: number;
  g: string;
}

const GRADIENTS = [
  "linear-gradient(135deg,#6C4BFF,#8A63FF)",
  "linear-gradient(135deg,#10B981,#06B6D4)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
];

const PLACEHOLDER_TRENDING: TrendingItem[] = [
  { tag: "Logo Design", count: 24, g: GRADIENTS[0] },
  { tag: "Math Tutoring", count: 38, g: GRADIENTS[1] },
  { tag: "Spanish", count: 17, g: GRADIENTS[2] },
  { tag: "Fitness Coaching", count: 21, g: GRADIENTS[3] },
];

const TrendingSkills = () => {
  const [trending, setTrending] = useState<TrendingItem[]>(PLACEHOLDER_TRENDING);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("category")
        .eq("is_active", true);

      if (cancelled || error || !data || data.length === 0) return;

      // Count listings per category
      const counts: Record<string, number> = {};
      data.forEach((s) => {
        counts[s.category] = (counts[s.category] || 0) + 1;
      });

      // Sort by count descending, take top 4
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([tag, count], i) => ({
          tag,
          count,
          g: GRADIENTS[i % GRADIENTS.length],
        }));

      if (top.length > 0 && !cancelled) {
        setTrending(top);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
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
                  <p className="text-xs opacity-90 mt-1">{t.count} {t.count === 1 ? "listing" : "listings"}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingSkills;
