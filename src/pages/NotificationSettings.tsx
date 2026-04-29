import { useEffect, useState } from "react";
import { ArrowLeft, Bell, MessageCircle, Calendar, Inbox, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_PREFS, getMyPrefs, upsertMyPrefs, type NotificationPrefs } from "@/lib/notificationService";
import { useToast } from "@/hooks/use-toast";

const items: Array<{ key: keyof NotificationPrefs; title: string; desc: string; Icon: any }> = [
  { key: "messages", title: "Messages", desc: "When someone sends you a chat message", Icon: MessageCircle },
  { key: "booking_updates", title: "Booking updates", desc: "Confirmations, schedule changes, reminders", Icon: Calendar },
  { key: "new_requests", title: "New requests", desc: "When someone wants to swap with you", Icon: Inbox },
  { key: "promotions", title: "Promotions", desc: "Occasional perks and city events", Icon: Megaphone },
];

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyPrefs(user.id).then((p) => { setPrefs(p); setLoading(false); });
  }, [user]);

  const update = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!user) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await upsertMyPrefs(user.id, next);
    } catch {
      toast({ title: "Could not save", description: "Please try again.", variant: "destructive" });
      setPrefs(prefs);
    }
  };

  return (
    <div className="min-h-safe-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-foreground/5 pt-safe">
        <div className="container flex items-center gap-3 h-14">
          <Link to="/dashboard" aria-label="Back" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-foreground/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </h1>
        </div>
      </header>

      <main className="container py-6 max-w-xl">
        <p className="text-sm text-muted-foreground mb-6">
          Choose what you want to hear about. These settings will also control push notifications when the iOS app launches.
        </p>

        <div className="space-y-2">
          {items.map(({ key, title, desc, Icon }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-foreground/5 shadow-soft"
            >
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(v) => update(key, v)}
                disabled={loading}
                aria-label={title}
              />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
          Push delivery requires the iOS or Android app. In the web version these toggles control in‑app notifications only.
        </p>
      </main>
    </div>
  );
};

export default NotificationSettings;
