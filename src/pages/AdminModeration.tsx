import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TrustBadge } from "@/components/TrustBadge";
import { isModeratorOrAdmin, listAllReports, updateReportStatus, type ReportStatus } from "@/lib/moderation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ShieldAlert, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

const STATUSES: { value: ReportStatus | "all"; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "actioned", label: "Actioned" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
];

export default function AdminModeration() {
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "all">("open");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAllowed(false); return; }
    isModeratorOrAdmin().then(setAllowed);
  }, [user, authLoading]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listAllReports(filter === "all" ? undefined : filter);
      setReports(data);
    } catch (e: any) {
      toast({ title: "Failed to load reports", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (allowed) refresh(); /* eslint-disable-next-line */ }, [allowed, filter]);

  const handleAction = async (reportId: string, status: ReportStatus) => {
    try {
      await updateReportStatus(reportId, status, notes[reportId]);
      toast({ title: `Report ${status}` });
      refresh();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  if (allowed === null || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="container py-10 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground mt-2">This area is restricted to moderators and admins.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-10 max-w-5xl">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" /> Moderation
            </h1>
            <p className="text-muted-foreground mt-1">Review and act on user reports.</p>
          </div>
        </header>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            {STATUSES.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-4">
          {loading && <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div>}
          {!loading && reports.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No reports in this view.
            </Card>
          )}
          {reports.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="destructive" className="capitalize">{r.reason.replace("_", " ")}</Badge>
                    <Badge variant="outline">Severity {r.severity}</Badge>
                    <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{r.reporter?.display_name ?? "User"}</span>
                    <span className="text-muted-foreground"> reported </span>
                    <span className="font-medium">{r.reported?.display_name ?? "User"}</span>
                    <span className="ml-2 inline-block align-middle"><TrustBadge userId={r.reported_user_id} compact /></span>
                  </div>
                  {r.details && (
                    <p className="mt-2 text-sm text-foreground/80 bg-secondary/50 rounded-lg p-3">{r.details}</p>
                  )}
                </div>
              </div>

              {(r.status === "open" || r.status === "reviewing") && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Reviewer notes (optional)"
                    value={notes[r.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    {r.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "reviewing")}>
                        Mark reviewing
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, "actioned")}>
                      Confirm & penalize
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction(r.id, "dismissed")}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
