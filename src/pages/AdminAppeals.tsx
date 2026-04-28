import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TrustBadge } from "@/components/TrustBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isModeratorOrAdmin } from "@/lib/moderation";
import {
  listAllAppeals, decideAppeal, listAppealNotes, addAppealNote,
  STATUS_TONE, type AppealStatus,
} from "@/lib/appeals";
import { toast } from "@/hooks/use-toast";
import { Loader2, Gavel, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { value: AppealStatus | "all"; label: string }[] = [
  { value: "submitted", label: "New" },
  { value: "under_review", label: "Reviewing" },
  { value: "need_more_info", label: "Needs info" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "all", label: "All" },
];

export default function AdminAppeals() {
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<AppealStatus | "all">("submitted");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [decision, setDecision] = useState<Record<string, { summary: string; reason: string; cooldown: number; internal: string; isInternal: boolean }>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAllowed(false); return; }
    isModeratorOrAdmin().then(setAllowed);
  }, [user, authLoading]);

  const refresh = async () => {
    setLoading(true);
    try { setItems(await listAllAppeals(filter === "all" ? undefined : filter)); }
    catch (e: any) { toast({ title: "Failed to load", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (allowed) refresh(); /* eslint-disable-next-line */ }, [allowed, filter]);
  useEffect(() => { if (activeId) listAppealNotes(activeId).then(setNotes); }, [activeId]);

  const get = (id: string) => decision[id] ?? { summary: "", reason: "", cooldown: 14, internal: "", isInternal: true };
  const setField = (id: string, field: string, value: any) =>
    setDecision((d) => ({ ...d, [id]: { ...get(id), [field]: value } }));

  const decide = async (id: string, status: "approved" | "denied" | "under_review" | "need_more_info") => {
    const d = get(id);
    try {
      await decideAppeal({ appealId: id, status, decision: d.summary || undefined, decisionReason: d.reason || undefined, cooldownDays: d.cooldown });
      toast({ title: `Appeal ${status}` });
      refresh();
    } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const addNote = async (id: string) => {
    const d = get(id);
    if (!d.internal.trim()) return;
    try {
      await addAppealNote({ appealId: id, body: d.internal, isInternal: d.isInternal });
      setField(id, "internal", "");
      if (activeId === id) setNotes(await listAppealNotes(id));
    } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  if (allowed === null || authLoading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!allowed) return (
    <><Navbar /><main className="container py-10 text-center">
      <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Access denied</h1>
    </main></>
  );

  return (
    <>
      <Navbar />
      <main className="container py-10 max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Gavel className="w-7 h-7 text-primary" /> Appeal Reviews
          </h1>
          <p className="text-muted-foreground mt-1">Review user appeals and issue decisions.</p>
        </header>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="flex-wrap h-auto">
            {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-4">
          {loading && <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div>}
          {!loading && items.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">No appeals in this view.</Card>
          )}
          {items.map((a) => {
            const d = get(a.id);
            const isOpen = activeId === a.id;
            return (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{a.action_type.replace("_"," ")}</Badge>
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_TONE[a.status as keyof typeof STATUS_TONE])}>
                        {a.status.replace("_"," ")}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span className="font-medium">{a.profile?.display_name ?? "User"}</span>
                      <TrustBadge userId={a.user_id} compact />
                    </div>
                    <p className="mt-2 text-sm bg-secondary/50 rounded-lg p-3">{a.reason}</p>
                    {a.evidence && <p className="mt-2 text-xs text-muted-foreground"><strong>Evidence:</strong> {a.evidence}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setActiveId(isOpen ? null : a.id)}>
                    {isOpen ? "Close" : "Review"}
                  </Button>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Decision summary</Label>
                        <Input value={d.summary} onChange={(e) => setField(a.id, "summary", e.target.value)} placeholder="e.g. Appeal accepted — flag removed" />
                      </div>
                      <div>
                        <Label>Cooldown days (on denial)</Label>
                        <Input type="number" min={0} value={d.cooldown} onChange={(e) => setField(a.id, "cooldown", Number(e.target.value))} />
                      </div>
                    </div>
                    <div>
                      <Label>Reasoning</Label>
                      <Textarea rows={2} value={d.reason} onChange={(e) => setField(a.id, "reason", e.target.value)} placeholder="Explain the decision to the user." />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => decide(a.id, "under_review")}>Mark reviewing</Button>
                      <Button size="sm" variant="outline" onClick={() => decide(a.id, "need_more_info")}>Request info</Button>
                      <Button size="sm" onClick={() => decide(a.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => decide(a.id, "denied")}>Deny</Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-2">Notes ({notes.length})</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notes.map((n) => (
                          <div key={n.id} className="text-sm">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{n.author?.display_name ?? "User"}</span>
                              {n.is_internal && <Badge variant="secondary" className="h-4 text-[10px]">internal</Badge>}
                              <span>{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            <p className="mt-0.5">{n.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 space-y-2">
                        <Textarea rows={2} value={d.internal} onChange={(e) => setField(a.id, "internal", e.target.value)} placeholder="Add a note…" />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Checkbox checked={d.isInternal} onCheckedChange={(v) => setField(a.id, "isInternal", !!v)} />
                            Internal (mods only)
                          </label>
                          <Button size="sm" onClick={() => addNote(a.id)}>Add note</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
