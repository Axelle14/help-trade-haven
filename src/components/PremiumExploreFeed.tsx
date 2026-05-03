import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Sparkles, Star, MapPin, BadgeCheck, Coins, Globe2,
  GraduationCap, Palette, Dumbbell, Languages, Code, FileText,
  Music, Camera, Wrench, Plus, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/pages/Matches";

const categories = [
  { label: "All", icon: Sparkles, color: "hsl(var(--primary))" },
  { label: "Tutoring", icon: GraduationCap, color: "#6C4BFF" },
  { label: "Design", icon: Palette, color: "#F59E0B" },
  { label: "Fitness", icon: Dumbbell, color: "#EC4899" },
  { label: "Language Lessons", icon: Languages, color: "#06B6D4" },
  { label: "Coding", icon: Code, color: "#8B5CF6" },
  { label: "Resume Help", icon: FileText, color: "#10B981" },
  { label: "Music", icon: Music, color: "#F97316" },
  { label: "Photography", icon: Camera, color: "#3B82F6" },
  { label: "Handyman", icon: Wrench, color: "#64748B" },
];

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const PremiumExploreFeed = () => {
  const { user } = useAuth();
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Get user's city if logged in
      let cityId: string | null = null;
      if (user) {
        const { data: mem } = await supabase
          .from("city_memberships")
          .select("city_id")
          .eq("user_id", user.id)
          .order("joined_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        cityId = mem?.city_id ?? null;
      }

      const { data, error } = await supabase.rpc("browse_services", {
        _user_city_id: cityId,
        _limit: 100,
      });
      if (cancelled) return;
      if (!error) {
        const all = (data ?? []) as Listing[];
        setListings(user ? all.filter((l) => l.user_id !== user.id) : all);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    let result = listings;
    if (active !== "All") result = result.filter((l) => l.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.display_name?.toLowerCase().includes(q)) ||
          (l.city_name?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [listings, active, query]);

  return (
    <section className="pt-2 pb-10 md:pt-6">
      {/* Header + search */}
      <div className="container">
        <div className="mb-5 md:mb-7">
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Explore</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Find a skill</h1>
        </div>

        <div className="relative flex items-center gap-2 rounded-3xl bg-card border border-border shadow-soft p-2.5 pl-5 focus-within:shadow-card focus-within:border-primary/30 transition-smooth">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="search"
            placeholder="Search skills, names, cities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Category icons rail */}
      <div className="container mt-6">
        <div className="grid grid-cols-4 min-[380px]:grid-cols-5 sm:grid-cols-6 md:grid-cols-11 gap-x-2 gap-y-3 md:gap-y-4">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = active === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActive(c.label)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 tap-scale transition-smooth pt-1 md:gap-1.5",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-smooth border",
                    isActive
                      ? "shadow-glow text-primary-foreground border-transparent"
                      : "bg-card border-border/50 shadow-soft",
                  )}
                  style={isActive ? { background: "var(--gradient-primary)" } : { color: c.color }}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.2} />
                </span>
                <span className="w-full text-center text-[11px] font-semibold leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div className="container pt-5 md:pt-8">
        <div className="flex items-end justify-between mb-3 md:mb-4">
          <h2 className="font-display font-bold text-xl md:text-2xl tracking-tight">
            {active === "All" ? "All skills" : active}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-3xl p-5 shadow-soft border border-border/50 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <p className="font-display font-bold text-lg">No listings yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Be the first to share a skill with the community.
            </p>
            <Button asChild size="sm">
              <Link to="/services/new"><Plus className="w-4 h-4" /> List a skill</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filtered.map((l, i) => {
              const name = l.display_name ?? "Member";
              const initials = initialsOf(name);
              const rating = l.rating ?? +(l.trust_score / 20).toFixed(1);
              return (
                <motion.article
                  key={l.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35 }}
                  className="bg-card rounded-3xl p-4 md:p-5 shadow-soft hover:shadow-card transition-smooth border border-border/50 flex flex-col tap-scale"
                >
                  <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm truncate">{name}</p>
                          {l.trust_score >= 80 && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-0.5 text-warning font-semibold">
                            <Star className="w-3 h-3 fill-warning" />{rating.toFixed(1)}
                          </span>
                          {l.city_name && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />{l.city_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-xl text-primary leading-none flex items-center gap-1 justify-end">
                        <Coins className="w-3.5 h-3.5" />{l.point_price}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">points</p>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-base leading-snug mb-1.5 line-clamp-2">{l.title}</h3>
                  {l.description && (
                    <p className="hidden md:block text-xs text-muted-foreground mb-4 line-clamp-2">{l.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {l.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground/70 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      {l.delivery_type === "online" ? <><Globe2 className="w-3 h-3" /> Online</>
                        : l.delivery_type === "both" ? <><Globe2 className="w-3 h-3" /> Hybrid</>
                        : <><MapPin className="w-3 h-3" /> In-person</>}
                    </span>
                  </div>

                  <Link
                    to="/matches"
                    className="mt-auto h-10 md:h-11 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center shadow-soft hover:shadow-glow tap-scale transition-smooth"
                  >
                    Book now
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PremiumExploreFeed;
