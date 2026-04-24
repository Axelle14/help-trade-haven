import { motion } from "framer-motion";
import { MessageCircle, Clock, CheckCircle2, Send } from "lucide-react";

const swaps = [
  {
    status: "Active",
    statusColor: "bg-success/15 text-success",
    icon: CheckCircle2,
    you: "Logo design",
    them: "Spanish lessons",
    partner: "Maya C.",
    progress: 65,
    msg: "Sent the first draft, let me know your thoughts!",
    time: "2m ago",
  },
  {
    status: "Pending",
    statusColor: "bg-warning/15 text-warning",
    icon: Clock,
    you: "Code review",
    them: "Yoga session",
    partner: "Jordan R.",
    progress: 25,
    msg: "Are you free Sunday morning for our first session?",
    time: "1h ago",
  },
  {
    status: "Completed",
    statusColor: "bg-primary/15 text-primary",
    icon: CheckCircle2,
    you: "Web dev",
    them: "Cooking class",
    partner: "Noah S.",
    progress: 100,
    msg: "Loved the carbonara! Leaving you 5 stars ✨",
    time: "Yesterday",
  },
];

const SwapTracker = () => {
  return (
    <section id="community" className="bg-gradient-to-b from-transparent via-card/50 to-transparent py-24 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Your swaps</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-5">
              Track every barter,
              <br />
              chat in one place.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Real-time messaging, status tracking, and gentle reminders keep every swap moving forward.
              No ghosting. No confusion. Just clear, respectful exchanges from "hello" to "thanks!".
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Active swaps", value: "1.2k", color: "text-success" },
                { label: "Avg response", value: "12m", color: "text-primary" },
                { label: "Completion rate", value: "94%", color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-5 shadow-soft border border-foreground/5">
                  <p className={`font-display font-bold text-3xl ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {swaps.map((swap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-3xl p-5 shadow-card border border-foreground/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${swap.statusColor}`}>
                    <swap.icon className="w-3 h-3" />
                    {swap.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{swap.time}</span>
                </div>

                <div className="flex items-center gap-3 mb-4 text-sm">
                  <span className="font-semibold">{swap.you}</span>
                  <span className="text-primary">↔</span>
                  <span className="font-semibold">{swap.them}</span>
                  <span className="text-muted-foreground text-xs ml-auto">w/ {swap.partner}</span>
                </div>

                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full gradient-primary rounded-full transition-smooth"
                    style={{ width: `${swap.progress}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm bg-background/60 rounded-2xl p-3">
                  <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-muted-foreground truncate flex-1">{swap.msg}</p>
                  <button className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-bounce">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SwapTracker;
