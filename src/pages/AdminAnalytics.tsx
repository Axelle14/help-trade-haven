import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/TrustBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isModeratorOrAdmin } from "@/lib/moderation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, AlertTriangle, Clock, Flag, Ban, ShieldX, Activity, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface Overview {
  open_reports: number; reviewing_reports: number;
  actioned_last_7d: number; dismissed_last_7d: number;
  avg_resolution_hours: number | null;
  flagged_users_7d: number; banned_users: number; restricted_users: number;
}
interface DistRow { bucket: string; count: number }
interface OffenderRow {
  user_id: string; display_name: string | null; avatar_url: string | null;
  trust_score: number; trust_status: string;
  report_count: number; flag_count: number; total: number;
}

const BUCKET_COLORS: Record<string, string> = {
  "0-19":   "hsl(var(--destructive))",
  "20-39":  "hsl(25 95% 55%)",
  "40-59":  "hsl(45 95% 55%)",
  "60-79":  "hsl(150 60% 50%)",
  "80-100": "hsl(150 70% 40%)",
};

function StatCard({ label, value, icon: Icon, tone, hint }: { label: string; value: React.ReactNode; icon: any; tone?: string; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={cn("rounded-full p-2.5", tone ?? "bg-primary/10 text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [distribution, setDistribution] = useState<DistRow[]>([]);
  const [offenders, setOffenders] = useState<OffenderRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAllowed(false); return; }
    isModeratorOrAdmin().then(setAllowed);
  }, [user, authLoading]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      setLoading(true);
      try {
        const [{ data: o, error: oe }, { data: d, error: de }, { data: r, error: re }] = await Promise.all([
          supabase.rpc("moderation_overview"),
          supabase.rpc("trust_distribution"),
          supabase.rpc("repeat_offenders", { _limit: 10 }),
        ]);
        if (oe) throw oe; if (de) throw de; if (re) throw re;
        setOverview((o as any)?.[0] ?? null);
        setDistribution((d as DistRow[]) ?? []);
        setOffenders((r as OffenderRow[]) ?? []);
      } catch (e: any) {
        toast({ title: "Failed to load analytics", description: e.message, variant: "destructive" });
      } finally { setLoading(false); }
    })();
  }, [allowed]);

  if (allowed === null || authLoading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!allowed) return (
    <><Navbar /><main className="container py-20 text-center">
      <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Access denied</h1>
    </main></>
  );

  return (
    <>
      <Navbar />
      <main className="container py-10 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" /> Moderation Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Health of the trust & safety system at a glance.</p>
        </header>

        {loading && <div className="text-center py-20"><Loader2 className="animate-spin inline" /></div>}

        {!loading && overview && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard label="Open reports" value={overview.open_reports}
                icon={AlertTriangle} tone="bg-destructive/10 text-destructive"
                hint={`${overview.reviewing_reports} in review`} />
              <StatCard label="Avg resolution" icon={Clock}
                value={overview.avg_resolution_hours != null ? `${overview.avg_resolution_hours}h` : "—"}
                hint="Time from report → decision" />
              <StatCard label="Flagged users · 7d" value={overview.flagged_users_7d}
                icon={Flag} tone="bg-amber-500/10 text-amber-500"
                hint={`${overview.actioned_last_7d} actioned · ${overview.dismissed_last_7d} dismissed`} />
              <StatCard label="Banned / Restricted"
                value={`${overview.banned_users} / ${overview.restricted_users}`}
                icon={Ban} tone="bg-orange-500/10 text-orange-500"
                hint="Current sanctioned users" />
            </section>

            <section className="grid gap-6 lg:grid-cols-2 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                      <ShieldX className="w-5 h-5 text-primary" /> Trust score distribution
                    </h2>
                    <p className="text-xs text-muted-foreground">Users grouped by current score</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                      <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {distribution.map((d) => (
                          <Cell key={d.bucket} fill={BUCKET_COLORS[d.bucket] ?? "hsl(var(--primary))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-primary" /> Repeat offenders
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Users with the most reports + flags</p>
                {offenders.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No offenders yet 🎉</p>}
                <ul className="divide-y">
                  {offenders.map((o, i) => (
                    <li key={o.user_id} className="flex items-center gap-3 py-3">
                      <span className="w-5 text-xs font-mono text-muted-foreground">{i + 1}</span>
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={o.avatar_url ?? undefined} />
                        <AvatarFallback>{(o.display_name ?? "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{o.display_name ?? "Unknown user"}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.report_count} reports · {o.flag_count} flags
                        </p>
                      </div>
                      <TrustBadge userId={o.user_id} compact />
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          </>
        )}
      </main>
    </>
  );
}
