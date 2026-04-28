import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  ACTION_TYPES, STATUS_TONE, type AppealActionType,
  listMyAppeals, submitAppeal, withdrawAppeal,
  listAppealNotes, addAppealNote,
} from "@/lib/appeals";
import { Loader2, Gavel, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Appeals() {
  const { user, loading: authLoading } = useAuth();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<AppealActionType>("warning");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  const refresh = async () => {
    setLoading(true);
    try { setAppeals(await listMyAppeals()); }
    catch (e: any) { toast({ title: "Failed to load", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) refresh(); }, [user]);
  useEffect(() => {
    if (!activeId) return;
    listAppealNotes(activeId).then(setNotes).catch(() => setNotes([]));
  }, [activeId]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <><Navbar /><main className="container py-20 text-center"><p>Please sign in to manage appeals.</p></main></>;

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      toast({ title: "Add more detail", description: "Reason should be at least 10 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await submitAppeal({ actionType, reason, evidence });
      toast({ title: "Appeal submitted", description: "A moderator will review it soon." });
      setOpen(false); setReason(""); setEvidence(""); refresh();
    } catch (e: any) {
      toast({ title: "Could not submit", description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async (id: string) => {
    try { await withdrawAppeal(id); toast({ title: "Appeal withdrawn" }); refresh(); }
    catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const handleAddNote = async () => {
    if (!activeId || newNote.trim().length < 1) return;
    try {
      await addAppealNote({ appealId: activeId, body: newNote });
      setNewNote("");
      setNotes(await listAppealNotes(activeId));
    } catch (e: any) {
      toast({ title: "Failed to add note", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Navbar />
      <main className="container py-10 max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Gavel className="w-7 h-7 text-primary" /> My Appeals
            </h1>
            <p className="text-muted-foreground mt-1">Contest warnings, restrictions, or bans applied to your account.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4" /> New appeal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit an appeal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>What are you appealing?</Label>
                  <Select value={actionType} onValueChange={(v) => setActionType(v as AppealActionType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Why is this unfair?</Label>
                  <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain what happened from your perspective…" />
                </div>
                <div>
                  <Label>Supporting evidence (optional)</Label>
                  <Textarea rows={3} value={evidence} onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Links, screenshots URLs, witnesses…" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : "Submit appeal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {loading && <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div>}
        {!loading && appeals.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">No appeals yet.</Card>
        )}

        <div className="space-y-3">
          {appeals.map((a) => (
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
                  <p className="text-sm">{a.reason}</p>
                  {a.decision && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm">
                      <div className="font-medium">Decision: {a.decision}</div>
                      {a.decision_reason && <p className="text-muted-foreground mt-1">{a.decision_reason}</p>}
                    </div>
                  )}
                  {a.cooldown_until && new Date(a.cooldown_until) > new Date() && (
                    <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> You can re-appeal after {new Date(a.cooldown_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => setActiveId(activeId === a.id ? null : a.id)}>
                    {activeId === a.id ? "Hide notes" : "View notes"}
                  </Button>
                  {(a.status === "submitted" || a.status === "need_more_info") && (
                    <Button size="sm" variant="ghost" onClick={() => handleWithdraw(a.id)}>Withdraw</Button>
                  )}
                </div>
              </div>

              {activeId === a.id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                  {notes.map((n) => (
                    <div key={n.id} className="text-sm">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{n.author?.display_name ?? "User"}</span>
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-0.5">{n.body}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note…" />
                    <Button onClick={handleAddNote}>Send</Button>
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
