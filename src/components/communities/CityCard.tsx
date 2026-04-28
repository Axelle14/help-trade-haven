import { Link } from "react-router-dom";
import { Users, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CityWithStats } from "@/lib/communities";

interface Props { city: CityWithStats; isMember?: boolean }

export const CityCard = ({ city, isMember }: Props) => {
  const trending = city.stats?.trending_skills ?? [];
  const swaps = city.stats?.swaps_completed ?? 0;
  return (
    <Link
      to={`/communities/${city.slug}`}
      className="group relative rounded-3xl bg-card border border-foreground/10 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-smooth flex flex-col gap-4 overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-smooth" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-2xl tracking-tight">{city.name}</h3>
            {isMember && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                <Sparkles className="w-3 h-3 mr-1" /> Joined
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {city.province} · {city.country}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold">{city.member_count}</span>
          <span className="text-muted-foreground">members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="font-semibold">{swaps}</span>
          <span className="text-muted-foreground">swaps/mo</span>
        </div>
      </div>

      {trending.length > 0 && (
        <div className="relative flex flex-wrap gap-1.5">
          {trending.slice(0, 4).map((s) => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground/80">
              {s}
            </span>
          ))}
        </div>
      )}

      <Button
        variant="soft"
        size="sm"
        className="relative w-full justify-between mt-auto group-hover:bg-primary group-hover:text-primary-foreground"
        asChild
      >
        <span>
          {isMember ? "Open community" : "Join community"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
        </span>
      </Button>
    </Link>
  );
};
