import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SwapListingCard from "@/components/SwapListingCard";
import type { Listing } from "@/pages/Matches";
export default function FeaturedServices() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let cancelled = false; supabase.rpc("browse_services", { _user_city_id: null, _limit: 4 }).then(({data}) => { if(!cancelled) { setListings((data || []) as Listing[]); setLoading(false); } }); return () => { cancelled = true; }; }, []);
  return <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 md:py-9"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-bold">Discover Swaps</h2><Link to="/explore" className="flex items-center gap-1 text-xs font-semibold text-primary">See all<ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{loading ? [0,1,2,3].map(i => <div key={i} className="h-64 animate-pulse rounded-lg bg-card" />) : listings.map(l => <SwapListingCard key={l.id} listing={l} />)}</div>{!loading && !listings.length && <p className="py-5 text-sm text-muted-foreground">No services listed yet.</p>}</section>;
}
