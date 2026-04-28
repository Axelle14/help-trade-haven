import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Sparkles, Users, ArrowRight, Plus } from "lucide-react";
import { CityCard } from "@/components/communities/CityCard";
import { JoinCityFunnel } from "@/components/communities/JoinCityFunnel";
import { listCities, type CityWithStats } from "@/lib/communities";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/waitlist";
import heroImg from "@/assets/communities-hero.jpg";
import SEO from "@/components/SEO";

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
    if (referralCode) {
      trackEvent("waitlist_referral_visit", { code: referralCode });
      setFunnelOpen(true);
    }
  }, [referralCode]);
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

  const openFunnel = (cityId?: string | null) => {
    trackEvent("waitlist_cta_clicked", { source: cityId ? "city_card" : "hero" });
    setPreselectedCityId(cityId ?? null);
    setFunnelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Local BC Communities — Service Swap"
        description="Join your British Columbia city's Service Swap community. Trade skills, meet trusted locals, and grow with your neighbours."
        canonical="/communities"
      />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-60" />
        <div className="container relative pt-4 pb-12 md:pt-6 md:pb-8 grid md:grid-cols-2 gap-12 items-center">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="hero" className="rounded-2xl">
                <Link to="/list-skill">
                  <Plus className="w-4 h-4" /> List Your Skill
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <Link to="/matches">
                  Browse Skills <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="ghost" onClick={() => openFunnel(null)} className="text-primary">
                <Sparkles className="w-3.5 h-3.5" /> Or join my city
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm">
              <div><div className="font-display font-bold text-2xl">{totals.cities}</div><div className="text-muted-foreground">cities</div></div>
              <div className="h-8 w-px bg-foreground/10" />
              <div><div className="font-display font-bold text-2xl">{totals.members > 0 ? totals.members : "Growing"}</div><div className="text-muted-foreground">{totals.members > 0 ? "neighbors" : "daily"}</div></div>
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
      <section id="cities" className="container py-8 md:py-12">
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
              <div key={c.id} className="relative group">
                <CityCard city={c} isMember={myCityIds.has(c.id)} />
                <button
                  onClick={() => openFunnel(c.id)}
                  className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-glow opacity-0 group-hover:opacity-100 transition-smooth hover:scale-105"
                  aria-label={`Join ${c.name} waitlist`}
                >
                  Join waitlist
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GROWTH LOOP */}
      <section className="container py-4 md:py-6">
        <div className="rounded-2xl gradient-primary text-primary-foreground p-5 md:p-6 grid md:grid-cols-3 gap-4 items-center shadow-float">
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-lg md:text-xl tracking-tight mb-1">
              Bring your crew. Earn local rep.
            </h3>
            <p className="opacity-90 max-w-xl text-xs md:text-sm">
              Invite 3 friends to your city's community and unlock the
              <span className="font-semibold"> Local Champion</span> badge. Help your city climb the BC leaderboard.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Button size="sm" variant="secondary" className="text-foreground" onClick={() => openFunnel(null)}>
              <Users className="w-4 h-4" /> Reserve my spot
            </Button>
          </div>
        </div>
      </section>

      <JoinCityFunnel
        open={funnelOpen}
        onOpenChange={setFunnelOpen}
        cities={cities}
        preselectedCityId={preselectedCityId}
        referralCode={referralCode}
      />

      {/* FUTURE: SPONSORS PLACEHOLDER */}
      <section className="container pb-6">
        <div className="rounded-2xl border-2 border-dashed border-foreground/15 p-3 md:p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Featured local partner</p>
          <p className="font-display text-sm md:text-base">
            Your city, powered by a local sponsor — <Link to="/" className="text-primary underline underline-offset-4">become a partner</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LocalCommunities;
