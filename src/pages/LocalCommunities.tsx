import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Sparkles, Users, ArrowRight } from "lucide-react";
import { CityCard } from "@/components/communities/CityCard";
import { JoinCityFunnel } from "@/components/communities/JoinCityFunnel";
import { listCities, type CityWithStats } from "@/lib/communities";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/waitlist";
import heroImg from "@/assets/communities-hero.jpg";

const LocalCommunities = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [cities, setCities] = useState<CityWithStats[]>([]);
  const [myCityIds, setMyCityIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [preselectedCityId, setPreselectedCityId] = useState<string | null>(null);

  useEffect(() => { listCities().then((c) => { setCities(c); setLoading(false); }); }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from("city_memberships").select("city_id").eq("user_id", user.id)
      .then(({ data }) => setMyCityIds(new Set((data ?? []).map((d) => d.city_id))));
  }, [user]);

  const filtered = useMemo(
    () => cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [cities, query]
  );

  const totals = useMemo(() => ({
    members: cities.reduce((s, c) => s + c.member_count, 0),
    swaps: cities.reduce((s, c) => s + (c.stats?.swaps_completed ?? 0), 0),
    cities: cities.length,
  }), [cities]);

  const goToFirstOrJoin = () => {
    if (myCityIds.size > 0) {
      const slug = cities.find((c) => myCityIds.has(c.id))?.slug;
      if (slug) return navigate(`/communities/${slug}`);
    }
    navigate(`/communities/${cities[0]?.slug ?? "vancouver"}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-60" />
        <div className="container relative py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-5 bg-primary/10 text-primary border-0 rounded-full px-3 py-1">
              <MapPin className="w-3 h-3 mr-1.5" /> Now live across British Columbia
            </Badge>
            <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6">
              Find your people. <span className="text-primary">Start local.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Join your city's Service Swap community to trade skills, meet trusted locals,
              and grow together — no money needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="hero" onClick={goToFirstOrJoin}>
                <Sparkles className="w-4 h-4" /> Join My City
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#cities">Explore BC Cities <ArrowRight className="w-4 h-4" /></a>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm">
              <div><div className="font-display font-bold text-2xl">{totals.cities}</div><div className="text-muted-foreground">cities</div></div>
              <div className="h-8 w-px bg-foreground/10" />
              <div><div className="font-display font-bold text-2xl">{totals.members}</div><div className="text-muted-foreground">neighbors</div></div>
              <div className="h-8 w-px bg-foreground/10" />
              <div><div className="font-display font-bold text-2xl">{totals.swaps}</div><div className="text-muted-foreground">swaps this month</div></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 gradient-primary opacity-20 blur-3xl rounded-full" />
            <img src={heroImg} alt="Local British Columbia community swapping skills" loading="lazy"
              className="relative rounded-[2rem] shadow-float w-full" />
          </div>
        </div>
      </section>

      {/* CITY SELECTOR */}
      <section id="cities" className="container py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">British Columbia</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Pick your city</h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Each city has its own chat, members, and trending skills. Tap in.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities…"
              className="pl-11 rounded-full bg-card h-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CityCard key={c.id} city={c} isMember={myCityIds.has(c.id)} />
            ))}
          </div>
        )}
      </section>

      {/* GROWTH LOOP */}
      <section className="container py-16">
        <div className="rounded-[2rem] gradient-primary text-primary-foreground p-10 md:p-14 grid md:grid-cols-3 gap-8 items-center shadow-float">
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
              Bring your crew. Earn local rep.
            </h3>
            <p className="opacity-90 max-w-xl">
              Invite 3 friends to your city's community and unlock the
              <span className="font-semibold"> Local Champion</span> badge. Help your city climb the BC leaderboard.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Button size="lg" variant="secondary" className="text-foreground">
              <Users className="w-4 h-4" /> Invite friends
            </Button>
          </div>
        </div>
      </section>

      {/* FUTURE: SPONSORS PLACEHOLDER */}
      <section className="container pb-20">
        <div className="rounded-3xl border-2 border-dashed border-foreground/15 p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Featured local partner</p>
          <p className="font-display text-xl">
            Your city, powered by a local sponsor — <Link to="/" className="text-primary underline underline-offset-4">become a partner</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LocalCommunities;
