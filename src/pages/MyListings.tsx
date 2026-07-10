import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Pencil, Plus, Loader2, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MyService {
  id: string;
  title: string;
  category: string;
  point_price: number;
  is_active: boolean;
  delivery_type: string;
  description: string | null;
  updated_at: string;
}

const MyListings = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MyService[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("services")
      .select("id,title,category,point_price,is_active,delivery_type,description,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const toggleActive = async (s: MyService) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success(s.is_active ? "Listing paused" : "Listing activated");
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container pt-10 pb-6 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Your skills</p>
          <h1 className="font-display font-bold text-xl leading-tight">My listings</h1>
        </div>
        <Button asChild size="sm">
          <Link to="/services/new"><Plus className="w-4 h-4" /> New</Link>
        </Button>
      </header>

      <div className="container max-w-2xl pb-16 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-foreground/5">
            <p className="text-muted-foreground mb-4">You haven't listed any skills yet.</p>
            <Button asChild><Link to="/services/new"><Plus className="w-4 h-4" /> List a skill</Link></Button>
          </div>
        ) : (
          items.map((s) => (
            <div key={s.id} className="bg-card rounded-3xl p-5 shadow-soft border border-foreground/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base leading-tight">{s.title}</h3>
                    {!s.is_active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.category} · {s.delivery_type.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-primary shrink-0">
                  <Coins className="w-4 h-4" /> {s.point_price}
                </div>
              </div>

              {s.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button asChild size="sm" variant="default" className="flex-1">
                  <Link to={`/services/${s.id}/edit`}><Pencil className="w-3.5 h-3.5" /> Edit</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>
                  {s.is_active ? <><EyeOff className="w-3.5 h-3.5" /> Pause</> : <><Eye className="w-3.5 h-3.5" /> Activate</>}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyListings;
