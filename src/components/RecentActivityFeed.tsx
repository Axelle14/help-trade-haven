import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";

const activity = [
  { who: "Marcus", what: "booked Logo Design", from: "Sarah", points: 80, when: "2m ago", g: "linear-gradient(135deg,#F59E0B,#F97316)" },
  { who: "Priya", what: "completed Resume Review", from: "Devon", points: 35, when: "8m ago", g: "linear-gradient(135deg,#10B981,#3B82F6)" },
  { who: "Jordan", what: "joined the marketplace", from: null, points: 100, when: "12m ago", g: "linear-gradient(135deg,#EC4899,#8B5CF6)" },
  { who: "Elena", what: "got a 5★ review", from: "Sarah", points: 0, when: "20m ago", g: "linear-gradient(135deg,#06B6D4,#3B82F6)" },
];

const RecentActivityFeed = () => (
  <section className="container py-10 md:py-14">
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Live</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Recent activity</h2>
      </div>
      <span className="text-[11px] font-semibold text-success flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Live
      </span>
    </div>

    <div className="rounded-3xl bg-card border border-border/50 shadow-soft overflow-hidden">
      {activity.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-4 border-b border-border/40 last:border-b-0 tap-scale hover:bg-secondary/40 transition-smooth"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0"
            style={{ background: a.g }}
          >
            {a.who[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-tight">
              <span className="font-semibold">{a.who}</span>{" "}
              <span className="text-muted-foreground">{a.what}</span>
              {a.from && <> <span className="text-muted-foreground">from</span> <span className="font-semibold">{a.from}</span></>}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{a.when}</p>
          </div>
          {a.points > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
              <Coins className="w-3 h-3" />+{a.points}
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      ))}
    </div>
  </section>
);

export default RecentActivityFeed;
