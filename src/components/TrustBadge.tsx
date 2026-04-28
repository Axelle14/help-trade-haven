import { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { getTrustScore } from "@/lib/moderation";
import { cn } from "@/lib/utils";

interface Props { userId: string; compact?: boolean }

export const TrustBadge = ({ userId, compact }: Props) => {
  const [data, setData] = useState<{ score: number; status: string } | null>(null);

  useEffect(() => { getTrustScore(userId).then(setData); }, [userId]);
  if (!data) return null;

  const map: Record<string, { Icon: typeof Shield; label: string; tone: string }> = {
    good:       { Icon: ShieldCheck, label: "Trusted",    tone: "text-emerald-500 bg-emerald-500/10" },
    watch:      { Icon: Shield,      label: "On watch",   tone: "text-amber-500 bg-amber-500/10" },
    restricted: { Icon: ShieldAlert, label: "Restricted", tone: "text-orange-500 bg-orange-500/10" },
    banned:     { Icon: ShieldX,     label: "Banned",     tone: "text-destructive bg-destructive/10" },
  };
  const { Icon, label, tone } = map[data.status] ?? map.good;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone)}>
      <Icon className="w-3.5 h-3.5" />
      {compact ? data.score : `${label} · ${data.score}`}
    </span>
  );
};
