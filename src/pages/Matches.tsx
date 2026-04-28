import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BadgeCheck, MapPin, Star, Users, Coins, Globe2, Plus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getMyWallet, type Wallet } from "@/lib/wallet";
import { placePointOrder } from "@/lib/orders";
import { toast } from "sonner";

type DeliveryFilter = "all" | "online" | "in_person";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  point_price: number;
  estimated_duration_minutes: number;
  delivery_type: "online" | "in_person";
  city_id: string | null;
  tags: string[];
  profile: { display_name: string; avatar_url: string | null } | null;
  city: { name: string } | null;
  trust_score: number;
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [myCityId, setMyCityId] = useState<string | null>(null);
  const [myCityName, setMyCityName] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeliveryFilter>("all");
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);

      const [walletData, membershipRes, servicesRes, trustRes, profilesRes, citiesRes] =
        await Promise.all([
          getMyWallet(user.id),
          supabase
            .from("city_memberships")
            .select("city_id, cities(name)")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("services")
            .select(
              "id,user_id,title,description,category,point_price,estimated_duration_minutes,delivery_type,city_id,tags",
            )
            .eq("is_active", true)
            .neq("user_id", user.id)
            .limit(100),
          supabase.from("trust_scores").select("user_id, score"),
          supabase.from("profiles").select("id, display_name, avatar_url"),
          supabase.from("cities").select("id, name"),
        ]);

      if (cancelled) return;

      const cityRow = membershipRes.data as
        | { city_id: string; cities: { name: string } | null }
        | null;
      setMyCityId(cityRow?.city_id ?? null);
      setMyCityName(cityRow?.cities?.name ?? null);
      setWallet(walletData);

      const profileMap = new Map(
        (profilesRes.data ?? []).map((p) => [p.id, p as { display_name: string; avatar_url: string | null }]),
      );
      const trustMap = new Map((trustRes.data ?? []).map((t) => [t.user_id, t.score]));
      const cityMap = new Map((citiesRes.data ?? []).map((c) => [c.id, c.name]));

      const enriched: Listing[] = (servicesRes.data ?? []).map((s) => ({
        id: s.id,
        user_id: s.user_id,
        title: s.title,
        description: s.description,
        category: s.category,
        point_price: s.point_price,
        estimated_duration_minutes: s.estimated_duration_minutes,
        delivery_type: s.delivery_type as "online" | "in_person",
        city_id: s.city_id,
        tags: (s.tags ?? []) as string[],
        profile: profileMap.get(s.user_id) ?? null,
        city: s.city_id ? { name: cityMap.get(s.city_id) ?? "" } : null,
        trust_score: trustMap.get(s.user_id) ?? 100,
      }));

      setListings(enriched);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Locality rule: online services are visible globally; in-person services only when in the same city.
  const visible = useMemo(() => {
    return listings
      .filter((l) => {
        if (filter === "online") return l.delivery_type === "online";
        if (filter === "in_person") return l.delivery_type === "in_person" && l.city_id === myCityId;
        // "all" → online global, in-person same-city only
        if (l.delivery_type === "online") return true;
        return l.city_id === myCityId;
      })
      .sort((a, b) => {
        // Same city first, then trust score, then price ascending.
        const sameA = a.city_id === myCityId ? 1 : 0;
        const sameB = b.city_id === myCityId ? 1 : 0;
        if (sameA !== sameB) return sameB - sameA;
        if (a.trust_score !== b.trust_score) return b.trust_score - a.trust_score;
        return a.point_price - b.point_price;
      });
  }, [listings, filter, myCityId]);

  const handleBook = async (listing: Listing) => {
    if (!wallet) return;
    if (wallet.balance_points < listing.point_price) {
      toast.error(
        `You need ${listing.point_price} points but only have ${wallet.balance_points}. Earn more by completing a service.`,
      );
      return;
    }
    setBookingId(listing.id);
    try {
      const order = await placePointOrder(listing.id);
      toast.success(`Booked! ${listing.point_price} points held in escrow.`);
      // Refresh wallet
      const w = await getMyWallet(user!.id);
      setWallet(w);
      navigate(`/chat/swap/${order.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <header className="container relative pt-10 pb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Local marketplace</p>
            <h1 className="font-display font-bold text-xl leading-tight">Find a skill</h1>
          </div>
        </div>
        <Button asChild size="sm" variant="default">
          <Link to="/services/new">
            <Plus className="w-4 h-4" />
            List a skill
          </Link>
        </Button>
      </header>

      {/* Wallet + locality strip */}
      <section className="container relative">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-xl leading-none">
                {wallet?.balance_points ?? "—"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Points to spend</p>
            </div>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 border border-foreground/5 flex items-center gap-3 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {myCityName ?? "No city yet"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {myCityName
                  ? "In-person services filtered to your city"
                  : <Link to="/communities" className="text-primary font-semibold">Join a community →</Link>}
              </p>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { v: "all", label: "All", icon: Users },
            { v: "online", label: "Online (anywhere)", icon: Globe2 },
            { v: "in_person", label: `In-person${myCityName ? ` · ${myCityName}` : ""}`, icon: MapPin },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-smooth ${
                filter === opt.v
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card border border-foreground/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="container relative pb-20">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-3xl p-6 shadow-soft border border-foreground/5 h-56 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 shadow-card border border-dashed border-foreground/10 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-5 flex items-center justify-center shadow-glow">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">No listings here yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {filter === "in_person" && !myCityName
                ? "Join a city community to see in-person services near you."
                : "Be one of the first — list a skill and start earning points right away."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/services/new">List a skill</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/communities">Explore communities</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {visible.map((l, i) => {
              const name = l.profile?.display_name ?? "Member";
              const initials = initialsOf(name);
              const canAfford = (wallet?.balance_points ?? 0) >= l.point_price;
              return (
                <motion.article
                  key={l.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="bg-card rounded-3xl p-6 shadow-card border border-foreground/5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm truncate">{name}</p>
                          {l.trust_score >= 80 && (
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            {l.trust_score}
                          </span>
                          {l.city && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5 truncate">
                                <MapPin className="w-3 h-3" />
                                {l.city.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-2xl text-primary leading-none flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {l.point_price}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        points
                      </p>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-2">
                    {l.title}
                  </h3>
                  {l.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {l.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      {l.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1">
                      {l.delivery_type === "online" ? (
                        <>
                          <Globe2 className="w-3 h-3" />
                          Online
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          In-person
                        </>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
                      ~{l.estimated_duration_minutes} min
                    </span>
                  </div>

                  <Button
                    onClick={() => handleBook(l)}
                    disabled={bookingId === l.id || !canAfford}
                    className="w-full mt-auto"
                    variant={canAfford ? "default" : "secondary"}
                  >
                    {bookingId === l.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                      </>
                    ) : canAfford ? (
                      <>
                        Book for {l.point_price} pts
                      </>
                    ) : (
                      <>Need {l.point_price - (wallet?.balance_points ?? 0)} more pts</>
                    )}
                  </Button>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Matches;
