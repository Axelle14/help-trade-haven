import { useEffect, useMemo, useState, FormEvent } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, X, Clock, AlertTriangle, CalendarCheck2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ScheduleProposal, AvailabilityWindow,
  listProposals, proposeTime, acceptProposal, declineProposal,
  checkConflict, listAvailability, isInsideAvailability,
  subscribeToProposals, formatProposalTime,
} from "@/lib/scheduling";

interface Props {
  swapId: string;
  meId: string;
  partnerId: string;
  partnerName: string;
  /** Already-confirmed time on the swap, if any. */
  scheduledAt: string | null;
  /** Default duration coming from the swap. */
  defaultDuration?: number;
  onScheduled?: () => void;
}

const STATUS_STYLE: Record<ScheduleProposal["status"], string> = {
  pending: "bg-warning/15 text-warning",
  accepted: "bg-success/15 text-success",
  declined: "bg-destructive/10 text-destructive",
  superseded: "bg-muted text-muted-foreground",
};

export const SchedulePanel = ({
  swapId, meId, partnerId, partnerName,
  scheduledAt, defaultDuration = 60, onScheduled,
}: Props) => {
  const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
  const [partnerAvailability, setPartnerAvailability] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(defaultDuration);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(false);

  // Initial load + realtime
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [p, av] = await Promise.all([
          listProposals(swapId),
          listAvailability(partnerId),
        ]);
        if (!alive) return;
        setProposals(p);
        setPartnerAvailability(av);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const unsub = subscribeToProposals(swapId, async () => {
      const p = await listProposals(swapId);
      setProposals(p);
    });
    return () => { alive = false; unsub(); };
  }, [swapId, partnerId]);

  const proposedDate = useMemo(() => {
    if (!date) return null;
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d;
  }, [date, time]);

  const insideAvailability = useMemo(() => {
    if (!proposedDate) return true;
    return isInsideAvailability(partnerAvailability, proposedDate, duration);
  }, [proposedDate, partnerAvailability, duration]);

  // Live conflict check (debounced lightly)
  useEffect(() => {
    if (!proposedDate) { setConflict(false); return; }
    const t = setTimeout(async () => {
      try {
        setConflict(await checkConflict(swapId, proposedDate, duration));
      } catch { /* ignore — server re-checks */ }
    }, 350);
    return () => clearTimeout(t);
  }, [swapId, proposedDate, duration]);

  const handlePropose = async (e: FormEvent) => {
    e.preventDefault();
    if (!proposedDate) return;
    setSubmitting(true);
    try {
      await proposeTime(swapId, meId, proposedDate, duration, note.trim() || undefined);
      toast.success("Time proposed — waiting for response");
      setDate(undefined); setNote(""); setConflict(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not propose time");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptProposal(id);
      toast.success("Time confirmed!");
      onScheduled?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not accept");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineProposal(id, meId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not decline");
    }
  };

  const pending = proposals.filter((p) => p.status === "pending");
  const history = proposals.filter((p) => p.status !== "pending");

  return (
    <div className="border-b border-foreground/5 bg-background/40">
      {/* Confirmed slot ribbon */}
      {scheduledAt && (
        <div className="bg-success/10 border-b border-success/20 px-4 py-2.5 flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs">
            <span className="font-bold text-success">Confirmed:</span>{" "}
            <span className="font-semibold text-foreground">{formatProposalTime(scheduledAt)}</span>
          </p>
        </div>
      )}

      <details className="group" open={!scheduledAt && pending.length > 0}>
        <summary className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-background/60 transition-smooth">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">
              {scheduledAt ? "Reschedule" : "Schedule this swap"}
            </span>
            {pending.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                {pending.length} pending
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
          <span className="text-xs text-muted-foreground hidden group-open:inline">Close</span>
        </summary>

        <div className="px-4 pb-4 space-y-4">
          {/* Pending proposals — top priority */}
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((p) => {
                const mine = p.proposed_by === meId;
                return (
                  <div key={p.id} className="bg-card rounded-2xl p-3 border border-foreground/5 shadow-soft">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                          {mine ? "You proposed" : `${partnerName} proposed`}
                        </p>
                        <p className="font-semibold text-sm">{formatProposalTime(p.proposed_for)}</p>
                        <p className="text-xs text-muted-foreground">{p.duration_minutes} min</p>
                        {p.note && <p className="text-xs italic text-muted-foreground mt-1">"{p.note}"</p>}
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0", STATUS_STYLE[p.status])}>
                        {p.status}
                      </span>
                    </div>
                    {!mine && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleAccept(p.id)}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDecline(p.id)}>
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Propose-time form */}
          <form onSubmit={handlePropose} className="bg-card rounded-2xl p-3 border border-foreground/5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Propose a {scheduledAt ? "new " : ""}time
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-10",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? format(date, "MMM d") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[30, 45, 60, 90, 120, 180].map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
              </div>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                maxLength={200}
                className="h-10 self-end"
              />
            </div>

            {/* Live warnings */}
            {proposedDate && conflict && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This overlaps another confirmed swap. Pick a different time.</span>
              </div>
            )}
            {proposedDate && !conflict && !insideAvailability && partnerAvailability.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Outside {partnerName}'s usual availability — they may decline.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!proposedDate || conflict || submitting}
              className="w-full"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {submitting ? "Sending…" : "Send proposal"}
            </Button>
          </form>

          {/* History */}
          {history.length > 0 && (
            <details>
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Past proposals ({history.length})
              </summary>
              <div className="mt-2 space-y-1">
                {history.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-background/60">
                    <span className="text-muted-foreground">{formatProposalTime(p.proposed_for)}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", STATUS_STYLE[p.status])}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {loading && proposals.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">Loading schedule…</p>
          )}
        </div>
      </details>
    </div>
  );
};
