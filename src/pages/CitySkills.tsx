import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BadgeCheck, Coins, Globe2, MapPin, Plus, Sparkles, Star, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CityRow {
  id: string;
  name: string;
  slug: string;
  province: string;
  country: string;
  member_count: number;
}

interface TrendingCategory { category: string; listing_count: number; }
interface TopProvider {
  id: string; display_name: string; avatar_url: string | null;
  trust_score: number; active_listings: number;
}
interface NewestListing {
  id: string; title: string; category: string; point_price: number;
  delivery_type: "online" | "in_person" | "both"; created_at: string;
  display_name: string; avatar_url: string | null;
}
interface Overview {
  total_active: number;
  trending_categories: TrendingCategory[];
  top_providers: TopProvider[];
  newest: NewestListing[];
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const CitySkills = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState<CityRow | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: cityRow } = await supabase
        .from("cities")
        .select("id, name, slug, province, country, member_count")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (!cityRow) { setLoading(false); return; }
      setCity(cityRow as CityRow);

      const { data, error } = await supabase.rpc("city_marketplace_overview", {
        _city_id: cityRow.id,
      });
      if (cancelled) return;
      if (error) toast.error(error.message);
      else setOverview(data as unknown as Overview);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (!loading && !city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-2">City not found</h1>
          <Button asChild variant="outline"><Link to="/communities">Browse all cities</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <header className="container relative pt-10 pb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/communities"
            className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth"
            aria-label="Back to communities"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">
              {city ? `${city.province}, ${city.country}` : "Loading…"}
            </p>
            <h1 className="font-display font-bold text-2xl leading-tight">
              {city ? `${city.name} Skills` : "—"}
            </h1>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to="/services/new"><Plus className="w-4 h-4" /> List a skill</Link>
        </Button>
      </header>

      {/* Stats strip */}
      <section className="container relative grid sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/15">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Active listings</p>
          </div>
          <p className="font-display font-bold text-3xl leading-none">
            {overview?.total_active ?? "—"}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-foreground/5 shadow-soft">
          <div className="flex items-center gap-2 text-accent mb-2">
            <Users className="w-4 h-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Members</p>
          </div>
          <p className="font-display font-bold text-3xl leading-none">{city?.member_count ?? "—"}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-foreground/5 shadow-soft">
          <div className="flex items-center gap-2 text-success mb-2">
            <TrendingUp className="w-4 h-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Trending</p>
          </div>
          <p className="font-display font-bold text-lg leading-tight truncate">
            {overview?.trending_categories[0]?.category ?? "—"}
          </p>
        </div>
      </section>

      {/* Trending categories */}
      {overview && overview.trending_categories.length > 0 && (
        <section className="container relative mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Trending categories</h2>
            <Link to="/matches" className="text-xs text-primary font-semibold">View all →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {overview.trending_categories.map((c) => (
              <span
                key={c.category}
                className="px-3 py-1.5 rounded-full bg-card border border-foreground/5 shadow-soft text-xs font-semibold flex items-center gap-1.5"
              >
                {c.category}
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-primary">{c.listing_count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Top providers */}
      {overview && overview.top_providers.length > 0 && (
        <section className="container relative mb-10">
          <h2 className="font-display font-bold text-lg mb-3">Top trusted providers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overview.top_providers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl p-4 border border-foreground/5 shadow-soft flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft shrink-0">
                  {initialsOf(p.display_name ?? "U")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm truncate">{p.display_name}</p>
                    {p.trust_score >= 80 && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-warning text-warning" /> {p.trust_score}
                    </span>
                    <span>·</span>
                    <span>{p.active_listings} listing{p.active_listings === 1 ? "" : "s"}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Newest services */}
      <section className="container relative pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Newest services</h2>
          {user && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/matches">Browse all →</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-3xl p-6 shadow-soft border border-foreground/5 h-40 animate-pulse" />
            ))}
          </div>
        ) : !overview || overview.newest.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 shadow-card border border-dashed border-foreground/10 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-5 flex items-center justify-center shadow-glow">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Be the first listing in {city?.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Post a skill and kick off the local marketplace here.
            </p>
            <Button asChild><Link to="/services/new">List a skill</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {overview.newest.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => navigate(user ? "/matches" : "/auth")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="text-left bg-card rounded-3xl p-5 shadow-card border border-foreground/5 hover:-translate-y-0.5 transition-smooth"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-soft">
                      {initialsOf(s.display_name ?? "U")}
                    </div>
                    <p className="font-semibold text-sm truncate">{s.display_name}</p>
                  </div>
                  <p className="font-display font-bold text-lg text-primary leading-none flex items-center gap-1 shrink-0">
                    <Coins className="w-4 h-4" /> {s.point_price}
                  </p>
                </div>
                <h3 className="font-display font-bold text-base leading-tight mb-2 line-clamp-2">{s.title}</h3>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground">{s.category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1">
                    {s.delivery_type === "online" ? <><Globe2 className="w-3 h-3" /> Online</>
                      : s.delivery_type === "both" ? <><Globe2 className="w-3 h-3" /> Both</>
                      : <><MapPin className="w-3 h-3" /> In-person</>}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitySkills;
