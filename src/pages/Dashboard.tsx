import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, Repeat2, ArrowUpRight, Sparkles, Home, Compass,
  MessageCircle, User, Plus, MapPin, Coins, LogOut, ListChecks, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getMyWallet, type Wallet } from "@/lib/wallet";

interface Profile {
  display_name: string;
  avatar_url: string | null;
}

interface Stats {
  ordersTotal: number;
  ordersCompleted: number;
  servicesActive: number;
  cityName: string | null;
  reviewCount: number;
  avgRating: number | null;
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "U";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet>({
    user_id: "", balance_points: 0, lifetime_earned: 0, lifetime_spent: 0,
  });
  const [stats, setStats] = useState<Stats>({
    ordersTotal: 0, ordersCompleted: 0, servicesActive: 0,
    cityName: null, reviewCount: 0, avgRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: p }, ordersRes, servicesRes, membershipRes, walletData, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("swaps").select("id,status,is_point_order")
          .or(`requester_id.eq.${user.id},provider_id.eq.${user.id},buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
        supabase.from("services").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("is_active", true),
        supabase.from("city_memberships").select("city_id, cities(name)").eq("user_id", user.id).limit(1).maybeSingle(),
        getMyWallet(user.id),
        supabase.rpc("user_review_summary", { _user_id: user.id }),
      ]);

      if (cancelled) return;

      const orders = (ordersRes.data ?? []) as Array<{ status: string }>;
      const completed = orders.filter((s) => s.status === "completed").length;
      const cityName =
        (membershipRes.data as { cities: { name: string } | null } | null)?.cities?.name ?? null;
      const review = Array.isArray(reviewsRes.data) ? reviewsRes.data[0] : null;

      setProfile(p ?? { display_name: user.email?.split("@")[0] ?? "Friend", avatar_url: null });
      setWallet(walletData);
      setStats({
        ordersTotal: orders.length,
        ordersCompleted: completed,
        servicesActive: servicesRes.count ?? 0,
        cityName,
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
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between"><h1 className="text-xl font-bold">Profile</h1><Button variant="outline" size="icon" onClick={handleSignOut} aria-label="Sign out"><LogOut /></Button></header>
        <div className="flex flex-col items-center py-8 text-center">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt={name} width={160} height={160} className="h-40 w-40 rounded-full object-cover" /> : <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-primary">{initials}</div>}
          <h2 className="mt-5 text-2xl font-bold">{name}</h2>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{stats.cityName || "No city selected"}</p>
        </div>
        <div className="grid grid-cols-3 gap-3"><div className="rounded-lg bg-card p-4"><p className="text-xl font-bold">{stats.ordersCompleted}</p><p className="mt-1 text-[11px] text-muted-foreground">Completed</p></div><div className="rounded-lg bg-card p-4"><p className="text-xl font-bold">{stats.ordersTotal - stats.ordersCompleted}</p><p className="mt-1 text-[11px] text-muted-foreground">Other orders</p></div><div className="rounded-lg bg-card p-4"><p className="text-xl font-bold">{stats.servicesActive}</p><p className="mt-1 text-[11px] text-muted-foreground">Active listings</p></div></div>
        <section className="mt-7 border-b border-border pb-6"><h3 className="flex items-center gap-2 text-sm font-bold"><Coins className="h-4 w-4" />Your points</h3><p className="mt-4 text-3xl font-bold">{wallet.balance_points}<span className="ml-2 text-xs font-normal text-muted-foreground">available</span></p><div className="mt-3 flex gap-6 text-xs text-muted-foreground"><span>{wallet.lifetime_earned} earned</span><span>{wallet.lifetime_spent} spent</span></div></section>
        <section className="mt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Offers...</h3><Link to="/my-listings" className="text-xs font-semibold text-primary">My listings</Link></div><p className="mt-3 text-xs text-muted-foreground">{stats.servicesActive} active service{stats.servicesActive === 1 ? "" : "s"}</p><Button asChild className="mt-4" size="sm"><Link to="/list-skill"><Plus />List a skill</Link></Button></section>
        <section className="mt-7 border-t border-border pt-6"><h3 className="text-sm font-bold">Reviews</h3><div className="mt-3 flex items-center gap-2"><Star className="h-4 w-4 text-warning" /><span className="font-bold">{stats.avgRating ? Number(stats.avgRating).toFixed(1) : "—"}</span><span className="text-xs text-muted-foreground">{stats.reviewCount} reviews</span></div></section>
        <div className="mt-8 grid grid-cols-2 gap-3"><Button asChild variant="outline"><Link to="/chat"><MessageCircle />Chats</Link></Button><Button asChild><Link to="/explore"><Compass />Explore</Link></Button></div>
      </div>
    </div>
  );
};
export default Dashboard;
