import { Button } from "@/components/ui/button";
import { Bell, Search, Star, BadgeCheck, Repeat2, ArrowUpRight, Sparkles, Home, Compass, MessageCircle, User, Plus, Trophy, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const matches = [
  {
    name: "Maya Chen",
    initials: "MC",
    from: "hsl(250 80% 65%)",
    to: "hsl(280 80% 70%)",
    service: "Brand & logo design",
    rating: 4.9,
    reviews: 47,
    verified: true,
    offers: "Logo kit",
    wants: "Spanish lessons",
  },
  {
    name: "Jordan Reyes",
    initials: "JR",
    from: "hsl(16 90% 65%)",
    to: "hsl(38 95% 65%)",
    service: "Yoga & mobility coach",
    rating: 5.0,
    reviews: 82,
    verified: true,
    offers: "4 sessions",
    wants: "Web dev",
  },
  {
    name: "Sara Bekele",
    initials: "SB",
    from: "hsl(180 70% 50%)",
    to: "hsl(220 80% 65%)",
    service: "Math tutoring",
    rating: 4.8,
    reviews: 31,
    verified: true,
    offers: "10h tutoring",
    wants: "Photo session",
  },
];

const activity = [
  {
    icon: CheckCircle2,
    color: "bg-success/15 text-success",
    title: "Swap completed with Noah S.",
    detail: "Web dev ↔ Cooking class",
    time: "2h ago",
  },
  {
    icon: MessageCircle,
    color: "bg-primary/15 text-primary",
    title: "Maya sent you a message",
    detail: "\"Sent the first draft, let me know!\"",
    time: "5h ago",
  },
  {
    icon: Trophy,
    color: "bg-warning/15 text-warning",
    title: "You earned 250 points",
    detail: "Glow tier unlocked ✨",
    time: "Yesterday",
  },
  {
    icon: Clock,
    color: "bg-accent/15 text-accent",
    title: "New match request",
    detail: "Aisha wants to trade music for video",
    time: "2d ago",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-28 relative">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <header className="relative px-6 pt-12 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft"
              style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(16 90% 65%))" }}
            >
              AL
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-display font-bold text-base leading-tight">Alex Lopez</p>
            </div>
          </div>
          <button className="relative w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent" />
          </button>
        </header>

        {/* Welcome message */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative px-6 pt-6"
        >
          <h1 className="font-display font-bold text-3xl leading-tight tracking-tight">
            Hey Alex 👋
            <br />
            <span className="text-primary">Let's swap something today.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            You have 3 fresh matches and 1 active swap waiting.
          </p>
        </motion.section>

        {/* Stats strip */}
        <section className="relative px-6 mt-6 grid grid-cols-3 gap-2">
          {[
            { label: "Points", value: "1,240", icon: Sparkles, color: "text-primary" },
            { label: "Swaps", value: "12", icon: Repeat2, color: "text-success" },
            { label: "Rating", value: "4.9", icon: Star, color: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 shadow-soft border border-foreground/5">
              <s.icon className={`w-4 h-4 ${s.color} mb-1.5`} />
              <p className="font-display font-bold text-lg leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Primary CTA */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative px-6 mt-5"
        >
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 shadow-float">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/10 blur-2xl" />
            <div className="absolute right-4 bottom-4 opacity-20">
              <Repeat2 className="w-20 h-20 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div className="relative">
              <p className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-wider mb-2">
                Ready when you are
              </p>
              <h2 className="font-display font-bold text-2xl text-primary-foreground leading-tight mb-4">
                Start a new swap
              </h2>
              <Button variant="outline" size="lg" className="bg-card hover:bg-card border-0 text-foreground font-bold">
                Start a Swap
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Search */}
        <section className="relative px-6 mt-6">
          <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 shadow-soft border border-foreground/5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skills, people, swaps..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </section>

        {/* Recommended matches */}
        <section className="relative mt-8">
          <div className="flex items-center justify-between px-6 mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">Recommended for you</h3>
              <p className="text-xs text-muted-foreground">Matched on your offered skills</p>
            </div>
            <button className="text-xs font-semibold text-primary">See all</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 px-6 snap-x snap-mandatory scrollbar-none">
            {matches.map((m, i) => (
              <motion.article
                key={m.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="snap-start shrink-0 w-[260px] bg-card rounded-3xl p-5 shadow-card border border-foreground/5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft shrink-0"
                    style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      {m.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <span className="font-medium text-foreground">{m.rating}</span>
                      <span>({m.reviews})</span>
                    </div>
                  </div>
                </div>

                <p className="font-display font-bold text-base leading-tight mb-3">{m.service}</p>

                <div className="bg-background/60 rounded-2xl p-3 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-success">Offers</span>
                    <span className="font-medium">{m.offers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-accent">Wants</span>
                    <span className="font-medium">{m.wants}</span>
                  </div>
                </div>

                <Button size="sm" className="w-full">
                  Propose swap
                </Button>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="relative px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Recent activity</h3>
            <button className="text-xs font-semibold text-primary">View all</button>
          </div>

          <div className="bg-card rounded-3xl shadow-soft border border-foreground/5 divide-y divide-foreground/5 overflow-hidden">
            {activity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-3 p-4 hover:bg-background/40 transition-smooth cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-2xl ${a.color} flex items-center justify-center shrink-0`}>
                  <a.icon className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card/90 backdrop-blur-xl rounded-full shadow-float border border-foreground/5 px-3 py-2 flex items-center justify-between z-50">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: Compass, label: "Explore" },
            { icon: null, label: "Swap" },
            { icon: MessageCircle, label: "Chat" },
            { icon: User, label: "Profile" },
          ].map((item, i) =>
            item.icon ? (
              <button
                key={i}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-smooth ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            ) : (
              <button
                key={i}
                className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow hover:scale-105 transition-bounce"
              >
                <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.8} />
              </button>
            ),
          )}
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
