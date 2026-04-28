import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AvailabilityWindow, DAYS_OF_WEEK,
  listAvailability, addAvailability, removeAvailability,
} from "@/lib/scheduling";

const Availability = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [day, setDay] = useState(1); // Mon
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("21:00");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try { setWindows(await listAvailability(user.id)); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const w = await addAvailability(user.id, day, `${start}:00`, `${end}:00`);
      setWindows((prev) => [...prev, w].sort((a, b) =>
        a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
      ));
      toast.success("Availability added");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not add window");
    } finally { setBusy(false); }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeAvailability(id);
      setWindows((prev) => prev.filter((w) => w.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-10">
        <header className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="w-10 h-10 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Scheduling</p>
            <h1 className="font-display font-bold text-xl">Your availability</h1>
          </div>
        </header>

        <p className="text-sm text-muted-foreground mb-6">
          Tell others when you're usually free. They'll see a hint when proposing times for a swap.
          Times are in <span className="font-semibold text-foreground">{tz}</span>.
        </p>

        <form onSubmit={handleAdd} className="bg-card rounded-3xl p-5 shadow-soft border border-foreground/5 mb-6 space-y-4">
          <p className="font-display font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add a window
          </p>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Day</label>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {DAYS_OF_WEEK.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(i)}
                  className={
                    "px-3 py-2 rounded-xl text-xs font-semibold transition-smooth " +
                    (day === i
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-background text-muted-foreground hover:text-foreground")
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To</label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Adding…" : "Add window"}
          </Button>
        </form>

        <div className="bg-card rounded-3xl shadow-soft border border-foreground/5 overflow-hidden">
          <div className="p-4 border-b border-foreground/5">
            <p className="font-display font-bold text-sm">Your weekly schedule</p>
          </div>

          {loading && <p className="p-4 text-xs text-muted-foreground">Loading…</p>}
          {!loading && windows.length === 0 && (
            <div className="p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">No availability set</p>
              <p className="text-xs text-muted-foreground">Add at least one window so partners can plan.</p>
            </div>
          )}

          {!loading && windows.length > 0 && (
            <ul className="divide-y divide-foreground/5">
              {windows.map((w) => (
                <li key={w.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{DAYS_OF_WEEK[w.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.start_time.slice(0, 5)} – {w.end_time.slice(0, 5)}{" "}
                      <span className="opacity-60">· {w.timezone}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(w.id)}
                    className="w-9 h-9 rounded-xl bg-background hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-smooth"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;
