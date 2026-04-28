import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell, Star, Repeat2, ArrowUpRight, Sparkles, Home, Compass,
  MessageCircle, User, Plus, MapPin, ShieldCheck, LogOut, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  display_name: string;
  avatar_url: string | null;
}

interface Stats {
  swapsTotal: number;
  swapsCompleted: number;
  servicesActive: number;
  cityName: string | null;
  trustScore: number;
  reviewCount: number;
  avgRating: number | null;
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    swapsTotal: 0, swapsCompleted: 0, servicesActive: 0,
    cityName: null, trustScore: 100, reviewCount: 0, avgRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: p }, swapsRes, servicesRes, membershipRes, trustRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("swaps").select("id,status", { count: "exact" })
          .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`),
        supabase.from("services").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("is_active", true),
        supabase.from("city_memberships").select("city_id, cities(name)").eq("user_id", user.id).limit(1).maybeSingle(),
        supabase.from("trust_scores").select("score").eq("user_id", user.id).maybeSingle(),
        supabase.rpc("user_review_summary", { _user_id: user.id }),
      ]);

      if (cancelled) return;

      const swaps = (swapsRes.data ?? []) as Array<{ status: string }>;
      const completed = swaps.filter((s) => s.status === "completed").length;
      const cityName =
        (membershipRes.data as { cities: { name: string } | null } | null)?.cities?.name ?? null;
      const review = Array.isArray(reviewsRes.data) ? reviewsRes.data[0] : null;

      setProfile(p ?? { display_name: user.email?.split("@")[0] ?? "Friend", avatar_url: null });
      setStats({
        swapsTotal: swaps.length,
        swapsCompleted: completed,
        servicesActive: servicesRes.count ?? 0,
        cityName,
        trustScore: trustRes.data?.score ?? 100,
        reviewCount: review?.review_count ?? 0,
        avgRating: review?.avg_rating ?? null,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const name = profile?.display_name ?? "Friend";
  const initials = initialsOf(name);
  const firstName = name.split(" ")[0];

  // Onboarding state
  const needsCity = !stats.cityName;
  const needsService = stats.servicesActive === 0;
  const isFirstRun = needsCity || needsService;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-32 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <header className="relative px-6 pt-12 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
              {initials}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-display font-bold text-base leading-tight">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:text-primary transition-smooth"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="relative px-6 pt-6"
        >
          <h1 className="font-display font-bold text-3xl leading-tight tracking-tight">
            Hey {firstName} 👋
            <br />
            <span className="text-primary">
              {isFirstRun ? "Let's get you set up." : "Let's swap something today."}
            </span>
          </h1>
          {!isFirstRun && (
            <p className="text-sm text-muted-foreground mt-2">
              {stats.swapsTotal > 0
                ? `${stats.swapsCompleted} of ${stats.swapsTotal} swaps completed.`
                : "You're ready — request your first swap from the matches page."}
            </p>
          )}
        </motion.section>

        {/* Stats strip */}
        <section className="relative px-6 mt-6 grid grid-cols-3 gap-2">
          {[
            { label: "Trust", value: stats.trustScore, icon: ShieldCheck, color: "text-primary" },
            { label: "Swaps", value: stats.swapsCompleted, icon: Repeat2, color: "text-success" },
            {
              label: "Rating",
              value: stats.avgRating ? Number(stats.avgRating).toFixed(1) : "—",
              icon: Star,
              color: "text-warning",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 shadow-soft border border-foreground/5">
              <s.icon className={`w-4 h-4 ${s.color} mb-1.5`} />
              <p className="font-display font-bold text-lg leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ONBOARDING STEPS — shown until city + first service */}
        {isFirstRun && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }} className="relative px-6 mt-5 space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Get started</p>

            <Link to="/communities"
              className={`flex items-center gap-4 bg-card rounded-3xl p-5 shadow-card border transition-smooth hover:shadow-float ${
                needsCity ? "border-primary/30" : "border-foreground/5 opacity-60"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {needsCity ? "Pick your city" : `Joined ${stats.cityName}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {needsCity ? "Find neighbors who can swap with you." : "City community is unlocked."}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>

            <Link to="/communities"
              className={`flex items-center gap-4 bg-card rounded-3xl p-5 shadow-card border transition-smooth hover:shadow-float ${
                !needsCity && needsService ? "border-primary/30" : "border-foreground/5 opacity-60"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {needsService ? "List your first skill" : "Skill listed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {needsService ? "Describe what you can offer the community." : "You're discoverable in your city."}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          </motion.section>
        )}

        {/* Primary CTA — shown after onboarding */}
        {!isFirstRun && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }} className="relative px-6 mt-5"
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
                  Find your next match
                </h2>
                <Button asChild variant="outline" size="lg" className="bg-card hover:bg-card border-0 text-foreground font-bold">
                  <Link to="/matches">
                    Browse matches
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Activity / empty state */}
        <section className="relative px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Recent activity</h3>
          </div>

          {loading ? (
            <div className="bg-card rounded-3xl p-6 shadow-soft border border-foreground/5 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : stats.swapsTotal === 0 ? (
            <div className="bg-card rounded-3xl p-8 shadow-soft border border-dashed border-foreground/10 text-center">
              <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="font-display font-bold text-lg mb-1">No swaps yet</p>
              <p className="text-sm text-muted-foreground mb-5">
                Once you request your first swap, you'll see it tracked here.
              </p>
              <Button asChild>
                <Link to="/communities">Explore communities</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-5 shadow-soft border border-foreground/5">
              <p className="text-sm text-muted-foreground">
                {stats.swapsTotal} active swap{stats.swapsTotal === 1 ? "" : "s"} —{" "}
                <Link to="/chat" className="text-primary font-semibold">open chat</Link>.
              </p>
            </div>
          )}
        </section>

        {/* Bottom nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card/90 backdrop-blur-xl rounded-full shadow-float border border-foreground/5 px-3 py-2 flex items-center justify-between z-50">
          {[
            { icon: Home, label: "Home", to: "/dashboard", active: true },
            { icon: Compass, label: "Explore", to: "/communities" },
            { icon: null, label: "Swap", to: "/matches" },
            { icon: MessageCircle, label: "Chat", to: "/chat" },
            { icon: User, label: "Profile", to: "/dashboard" },
          ].map((item, i) =>
            item.icon ? (
              <Link key={i} to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-smooth ${
                  item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            ) : (
              <Link key={i} to={item.to}
                className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow hover:scale-105 transition-bounce"
              >
                <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.8} />
              </Link>
            ),
          )}
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
