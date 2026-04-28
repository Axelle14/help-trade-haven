import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/TrustBadge";
import { CityChat } from "@/components/communities/CityChat";
import { NearbyMembersFeed } from "@/components/communities/NearbyMembersFeed";
import {
  ArrowLeft, Users, TrendingUp, Sparkles, MessageCircle, MapPin, Calendar, Trophy, Quote,
} from "lucide-react";
import {
  getCityBySlug, isMemberOfCity, joinCity, leaveCity, listCityMembers, type CityWithStats,
} from "@/lib/communities";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STORIES = [
  { quote: "I traded math tutoring for logo design. Both of us leveled up.", author: "Priya, student" },
  { quote: "Found a workout coach two blocks away. We swap meals + sessions.", author: "Marcus, designer" },
  { quote: "Saved hundreds and made real friends. This is what cities should feel like.", author: "Linh, dev" },
];

const CityHub = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState<CityWithStats | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [topMembers, setTopMembers] = useState<Awaited<ReturnType<typeof listCityMembers>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const c = await getCityBySlug(slug);
      if (!c) { setLoading(false); return; }
      setCity(c);
      const [mem, members] = await Promise.all([
        user ? isMemberOfCity(c.id) : Promise.resolve(false),
        listCityMembers(c.id, 10),
      ]);
      setIsMember(mem);
      setTopMembers([...members].sort((a, b) => b.trust.score - a.trust.score).slice(0, 5));
      setLoading(false);
    })();
  }, [slug, user]);

  const handleJoinToggle = async () => {
    if (!user) return navigate("/auth");
    if (!city) return;
    try {
      if (isMember) {
        await leaveCity(city.id);
        setIsMember(false);
        toast.success(`Left ${city.name}`);
      } else {
        await joinCity(city.id);
        setIsMember(true);
        toast.success(`Welcome to ${city.name}! 🎉`);
      }
      const refreshed = await getCityBySlug(city.slug);
      if (refreshed) setCity(refreshed);
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center text-muted-foreground">Loading community…</div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display font-bold text-3xl mb-4">City not found</h1>
          <Button asChild><Link to="/communities">Back to Communities</Link></Button>
        </div>
      </div>
    );
  }

  const trending = city.stats?.trending_skills ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-foreground/5">
        <div className="absolute inset-0 gradient-warm opacity-50" />
        <div className="container relative py-10 md:py-14">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/communities"><ArrowLeft className="w-4 h-4" /> All BC cities</Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-2">
                <MapPin className="w-4 h-4" /> {city.province}, {city.country}
              </div>
              <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight mb-4">
                {city.name} <span className="text-muted-foreground/60 font-normal text-3xl">community</span>
              </h1>
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{city.member_count}</span>
                  <span className="text-muted-foreground">members</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="font-semibold">{city.stats?.swaps_completed ?? 0}</span>
                  <span className="text-muted-foreground">swaps this month</span>
                </div>
              </div>
            </div>
            <Button size="lg" variant={isMember ? "outline" : "hero"} onClick={handleJoinToggle}>
              {isMember ? <>Leave</> : <><Sparkles className="w-4 h-4" /> Join {city.name}</>}
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="container py-10 md:py-14 grid lg:grid-cols-3 gap-8">
        {/* LEFT: tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="bg-card border border-foreground/10 rounded-full p-1 h-auto">
              <TabsTrigger value="chat" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageCircle className="w-4 h-4 mr-1" /> Chat
              </TabsTrigger>
              <TabsTrigger value="members" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-1" /> Members
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-4 h-4 mr-1" /> Skills
              </TabsTrigger>
              <TabsTrigger value="stories" className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Quote className="w-4 h-4 mr-1" /> Stories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <CityChat cityId={city.id} cityName={city.name} />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <NearbyMembersFeed cityId={city.id} cityName={city.name} />
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <div className="rounded-3xl bg-card border border-foreground/10 p-8">
                <h3 className="font-display font-bold text-2xl mb-2">Trending in {city.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">What locals are swapping this week.</p>
                <div className="flex flex-wrap gap-2">
                  {trending.length === 0 && <span className="text-muted-foreground text-sm">No trends yet — be the first.</span>}
                  {trending.map((s, i) => (
                    <Badge key={s} variant="secondary" className={`rounded-full px-4 py-2 text-sm ${i === 0 ? "bg-primary text-primary-foreground" : ""}`}>
                      {i === 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stories" className="mt-6 space-y-4">
              {STORIES.map((s, i) => (
                <div key={i} className="rounded-3xl bg-card border border-foreground/10 p-6 shadow-soft">
                  <Quote className="w-6 h-6 text-primary/40 mb-3" />
                  <p className="font-display text-lg leading-snug mb-3">"{s.quote}"</p>
                  <p className="text-sm text-muted-foreground">{s.author} · {city.name}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: sidebar */}
        <aside className="space-y-6">
          {/* Sponsor placeholder */}
          <div className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Sponsored</p>
            <p className="text-sm font-medium">{city.name} community powered by a local partner</p>
          </div>

          {/* Top trusted */}
          <div className="rounded-3xl bg-card border border-foreground/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="font-display font-bold text-lg">Top trusted members</h3>
            </div>
            {topMembers.length === 0 && <p className="text-sm text-muted-foreground">No members yet.</p>}
            <div className="space-y-3">
              {topMembers.map((m, i) => (
                <div key={m.user_id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={m.profile.avatar_url ?? undefined} />
                    <AvatarFallback>{m.profile.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.profile.display_name}</p>
                  </div>
                  <TrustBadge userId={m.user_id} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Events placeholder */}
          <div className="rounded-3xl bg-card border border-foreground/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-lg">Upcoming meetups</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Local meetups are coming soon. Want to host one in {city.name}?
            </p>
            <Button variant="soft" size="sm" className="w-full">Become a city ambassador</Button>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
};

export default CityHub;
