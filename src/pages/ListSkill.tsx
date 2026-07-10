import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Coins, Loader2, MapPin, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  "Other",
];

const ListSkill = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);

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
  const [customCategory, setCustomCategory] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [priceDirty, setPriceDirty] = useState(false);

  // Fetch available cities for optional tagging
  useEffect(() => {
    supabase
      .from("cities")
      .select("id, name, province")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, []);

  // Load existing listing when editing
  useEffect(() => {
    if (!isEdit || !user || !editId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", editId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Listing not found");
        navigate("/my-listings");
        return;
      }
      if (data.user_id !== user.id) {
        toast.error("You can only edit your own listings");
        navigate("/my-listings");
        return;
      }
      setTitle(data.title);
      setDescription(data.description ?? "");
      const known = CATEGORIES.includes(data.category);
      setCategory(known ? data.category : "Other");
      if (!known) setCustomCategory(data.category);
      setDelivery(data.delivery_type);
      setDuration(data.estimated_duration_minutes);
      setRadiusKm(data.service_radius_km);
      setPrice(data.point_price);
      setCityId(data.city_id);
      setContactInfo((data as { contact_info: string | null }).contact_info ?? "");
      setIsActive(data.is_active);
      setPriceDirty(true); // don't auto-overwrite on edit
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isEdit, editId, user, navigate]);

  // Recompute suggested price when inputs change
  useEffect(() => {
    if (!user) return;
    if (category === "Other") {
      const perHour = 40;
      const raw = Math.round(perHour * (duration / 60));
      const clamped = Math.max(20, Math.min(200, raw));
      const range = { suggested: clamped, min_price: Math.round(clamped * 0.6), max_price: Math.round(clamped * 1.5) };
      setSuggested(range);
      if (!priceDirty) setPrice(range.suggested);
      return;
    }
    let cancelled = false;
    suggestPointPrice(category, duration, user.id).then((s) => {
      if (cancelled) return;
      setSuggested(s);
      if (!priceDirty) setPrice(s.suggested);
    });
    return () => { cancelled = true; };
  }, [category, duration, user, priceDirty]);

  const valid = useMemo(
    () => title.trim().length >= 3 && price >= 5 && price <= 1000 && (category !== "Other" || customCategory.trim().length >= 2),
    [title, price, category, customCategory],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !valid) return;
    setSubmitting(true);
    try {
      const finalCategory = category === "Other" ? customCategory.trim() : category;
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category: finalCategory,
        point_price: price,
        estimated_duration_minutes: duration,
        delivery_type: delivery,
        service_radius_km: radiusKm,
        city_id: cityId || null,
        contact_info: contactInfo.trim() || null,
        is_active: isActive,
      };

      if (isEdit && editId) {
        const { error } = await supabase.from("services").update(payload).eq("id", editId);
        if (error) throw error;
        toast.success("Listing updated");
        navigate("/my-listings");
      } else {
        const { error } = await supabase.from("services").insert({
          ...payload,
          user_id: user.id,
          tags: [],
        });
        if (error) throw error;
        toast.success("Skill listed! It's now visible in the marketplace.");
        navigate("/matches");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editId || !confirm("Delete this listing? This cannot be undone.")) return;
    const { error } = await supabase.from("services").delete().eq("id", editId);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    navigate("/my-listings");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <header className="container relative pt-10 pb-6 flex items-center gap-4">
        <Link
          to={isEdit ? "/my-listings" : "/matches"}
          className="w-11 h-11 rounded-2xl bg-card border border-foreground/5 shadow-soft flex items-center justify-center hover:-translate-x-0.5 transition-smooth"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">{isEdit ? "Update listing" : "New listing"}</p>
          <h1 className="font-display font-bold text-xl leading-tight">{isEdit ? "Edit skill" : "List a skill"}</h1>
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
              placeholder="Describe what you offer, how it works, and what the person will walk away with."
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
              {category === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter your skill category"
                  maxLength={60}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
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

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              City <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select value={cityId ?? "_none"} onValueChange={(v) => setCityId(v === "_none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="No city selected" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No city — visible everywhere</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}, {c.province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Tag a city so locals can find your listing more easily.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact info <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="contact"
              maxLength={200}
              placeholder="e.g. email, phone, or preferred way to reach you"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Only shown to users after they book. Leave empty to use in-app chat only.</p>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Availability</Label>
            <Link to="/availability" className="text-xs text-primary underline underline-offset-2">
              Manage weekly availability →
            </Link>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-2xl border border-foreground/5 p-4">
              <div>
                <p className="text-sm font-medium">Listing is {isActive ? "active" : "paused"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? "Visible in the marketplace." : "Hidden — buyers cannot book it."}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>

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
              onChange={(e) => { setPrice(Number(e.target.value) || 0); setPriceDirty(true); }}
              className="text-2xl font-display font-bold h-14"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1" disabled={!valid || submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <>{isEdit ? "Save changes" : "Publish listing"}</>
            )}
          </Button>
          {isEdit && (
            <Button type="button" variant="outline" size="lg" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ListSkill;
