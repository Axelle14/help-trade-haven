import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { listCityMembers } from "@/lib/communities";
import { MessageCircle, Crown, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Props { cityId: string; cityName: string }

export const NearbyMembersFeed = ({ cityId, cityName }: Props) => {
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listCityMembers>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCityMembers(cityId).then((m) => { setMembers(m); setLoading(false); });
  }, [cityId]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="rounded-3xl bg-card border border-foreground/10 p-8 text-center">
        <p className="text-muted-foreground">Be the first to join {cityName} 👋</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {members.map((m) => (
        <div key={m.user_id} className="rounded-2xl bg-card border border-foreground/10 p-5 shadow-soft hover:shadow-card transition-smooth flex gap-4">
          <Avatar className="w-14 h-14 shrink-0">
            <AvatarImage src={m.profile.avatar_url ?? undefined} />
            <AvatarFallback>{m.profile.display_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold truncate">{m.profile.display_name}</h4>
              {m.role !== "member" && (
                <Badge variant="secondary" className="bg-accent/15 text-accent-foreground border-0 text-[10px]">
                  <Crown className="w-3 h-3 mr-1" /> {m.role}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {m.profile.bio || "Member of the local Service Swap community."}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <TrustBadge userId={m.user_id} compact />
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {cityName}
              </span>
            </div>
          </div>
          <Button asChild size="icon" variant="soft" className="self-start shrink-0">
            <Link to="/chat"><MessageCircle className="w-4 h-4" /></Link>
          </Button>
        </div>
      ))}
    </div>
  );
};
