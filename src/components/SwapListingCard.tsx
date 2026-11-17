import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, MessageSquare, Tag, Star, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/pages/Matches";

export default function SwapListingCard({ listing }: { listing: Listing }) {
  const [broken, setBroken] = useState(false);
  const name = listing.display_name || "Member";
  return (
    <article className="swap-listing flex h-full min-w-0 flex-col rounded-lg bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {listing.avatar_url && !broken ? <img src={listing.avatar_url} onError={() => setBroken(true)} alt={name} width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">{name.slice(0, 2).toUpperCase()}</span>}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">{listing.delivery_type === "online" ? <Globe2 className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}<span className="truncate">{listing.distance_km != null ? `${Number(listing.distance_km).toFixed(1)} km` : listing.city_name || (listing.delivery_type === "online" ? "Online" : "Location not set")}</span></p>
          </div>
        </div>
        {listing.rating ? <span className="flex shrink-0 items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] text-warning"><Star className="h-3 w-3" />{listing.rating.toFixed(1)}</span> : <span className="shrink-0 text-xs font-bold text-primary">{listing.point_price} pts</span>}
      </div>
      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-foreground">{listing.description || listing.title}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold"><Tag className="h-3.5 w-3.5" /> Offers...</div>
      <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded bg-muted px-2 py-1 text-[10px] font-medium">{listing.title}</span><span className="rounded bg-muted px-2 py-1 text-[10px] font-medium">{listing.category}</span></div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground"><span>{listing.delivery_type === "both" ? "Online & in person" : listing.delivery_type === "online" ? "Online service" : "In-person service"}</span><span className="font-semibold text-foreground">{listing.point_price} points</span></div>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <Button asChild variant="outline" size="sm" className="px-2 text-[11px]"><Link to="/matches"><MessageSquare />Chat to Swap</Link></Button>
        <Button asChild size="sm" className="px-2 text-[11px]"><Link to="/matches">View service<ArrowUpRight /></Link></Button>
      </div>
    </article>
  );
}