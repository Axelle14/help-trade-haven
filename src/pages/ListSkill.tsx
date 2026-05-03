import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Loader2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { suggestPointPrice } from "@/lib/wallet";
import { toast } from "sonner";

const CATEGORIES = [
  "Tutoring", "Design", "Coding", "Fitness", "Photography", "Writing",
  "Resume Help", "Language Lessons", "Music", "Cooking", "Handyman", "Gardening",
];

const ListSkill = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tutoring");
  const [delivery, setDelivery] = useState<"online" | "in_person" | "both">("in_person");
  const [duration, setDuration] = useState(60);
  const [radiusKm, setRadiusKm] = useState(25);
  const [price, setPrice] = useState(40);
  const [suggested, setSuggested] = useState<{ suggested: number; min_price: number; max_price: number } | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: string; name: string; province: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available cities for optional tagging
  useEffect(() => {
    supabase
      .from("cities")
      .select("id, name, province")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, []);

  // Recompute suggested price when inputs change
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    suggestPointPrice(category, duration, user.id).then((s) => {
      if (cancelled) return;
      setSuggested(s);
      setPrice(s.suggested);
    });
    return () => { cancelled = true; };
  }, [category, duration, user]);

  const valid = useMemo(
    () => title.trim().length >= 3 && price >= 5 && price <= 1000,
    [title, price],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !valid) return;
    if (delivery !== "online" && !cityId) {
      toast.error("Join a city community before listing in-person services.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("services").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        point_price: price,
        estimated_duration_minutes: duration,
        delivery_type: delivery,
        service_radius_km: radiusKm,
        city_id: delivery === "online" ? null : cityId,
        is_active: true,
        tags: [],
      });
      if (error) throw error;
      toast.success("Skill listed! It's now visible in the marketplace.");
      navigate("/matches");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <header className="container relative pt-10 pb-6 flex items-center gap-4">
        <Link
          to="/matches"
          className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth"
          aria-label="Back to marketplace"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">New listing</p>
          <h1 className="font-display font-bold text-xl leading-tight">List a skill</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container relative pb-10 max-w-2xl space-y-6">
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-foreground/5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              maxLength={120}
              placeholder="e.g. 1-on-1 React coaching session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={4}
              placeholder="What will the buyer get? Be specific about scope and outcome."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery</Label>
              <Select value={delivery} onValueChange={(v) => setDelivery(v as "online" | "in_person" | "both")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In-person (your city)</SelectItem>
                  <SelectItem value="online">Online (anywhere)</SelectItem>
                  <SelectItem value="both">Both (online + local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={600}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 60)}
              />
            </div>
            {delivery !== "online" && (
              <div className="space-y-2">
                <Label htmlFor="radius">Service radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={500}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value) || 25)}
                />
                <p className="text-[11px] text-muted-foreground">Shown to buyers as your travel range.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 border border-primary/15 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider">Suggested pricing</p>
          </div>

          {suggested && (
            <p className="text-sm text-muted-foreground">
              Based on category, duration, and your trust score, we suggest{" "}
              <span className="font-display font-bold text-foreground">{suggested.suggested} pts</span>{" "}
              (range {suggested.min_price}–{suggested.max_price}).
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-primary" />
              Your price (points)
            </Label>
            <Input
              id="price"
              type="number"
              min={5}
              max={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="text-2xl font-display font-bold h-14"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!valid || submitting}>
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
          ) : (
            <>Publish listing</>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ListSkill;
