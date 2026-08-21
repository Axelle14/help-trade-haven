import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Listing } from "@/pages/Matches";

const categories = [
  { label: "All", emoji: "" },
  { label: "Design", emoji: "🎨" },
  { label: "Tech", emoji: "💻" },
  { label: "Writing", emoji: "📝" },
  { label: "Photography", emoji: "📷" },
  { label: "Tutoring", emoji: "🎓" },
  { label: "Home Services", emoji: "🌿" },
  { label: "Music", emoji: "🎵" },
  { label: "Other", emoji: "✨" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Design: "🎨",
  Tech: "💻",
  Coding: "💻",
  Writing: "📝",
  "Resume Help": "📝",
  Photography: "📷",
  Tutoring: "🎓",
  "Language Lessons": "🗣️",
  "Home Services": "🌿",
  Handyman: "🔧",
  Music: "🎵",
  Fitness: "🏋️",
  Other: "✨",
};

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "U";

const PremiumExploreFeed = () => {
  const { user } = useAuth();
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let cityId: string | null = null;
      if (user) {
        const { data: mem } = await supabase
          .from("city_memberships")
          .select("city_id")
          .eq("user_id", user.id)
          .order("joined_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        cityId = mem?.city_id ?? null;
      }

      const { data, error } = await supabase.rpc("browse_services", {
        _user_city_id: cityId,
        _limit: 100,
      });
      if (cancelled) return;
      if (!error) {
        const all = (data ?? []) as Listing[];
        setListings(user ? all.filter((l) => l.user_id !== user.id) : all);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    let result = listings;
    if (active !== "All") result = result.filter((l) => l.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.display_name?.toLowerCase().includes(q) ||
          l.city_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, active, query]);

  return (
    <section className="browse-theme py-8 md:py-12">
      <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-[2.4rem] leading-tight text-[hsl(var(--browse-ink))]">
              Browse <span className="italic text-[hsl(var(--browse-accent))]">Services</span>
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--browse-muted))]">
              {loading ? "Loading services…" : `${filtered.length} service${filtered.length === 1 ? "" : "s"} available`}
            </p>
          </div>
          <Link
            to="/services/new"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[hsl(var(--browse-ink))] shadow-soft transition-smooth hover:opacity-90 border border-[hsl(var(--browse-line))]"
          >
            Join to List
          </Link>
        </div>

        {/* Search */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[hsl(var(--browse-line))] bg-white px-5 py-3.5 shadow-soft focus-within:border-[hsl(var(--browse-accent))]">
          <Search className="h-4 w-4 shrink-0 text-[hsl(var(--browse-muted))]" />
          <input
            type="search"
            placeholder="Search services, skills, providers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--browse-muted))]"
          />
        </div>

        {/* Category pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => {
            const isActive = active === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActive(c.label)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-smooth",
                  isActive
                    ? "border-transparent bg-[hsl(var(--browse-ink))] text-white"
                    : "border-[hsl(var(--browse-line))] bg-white text-[hsl(var(--browse-ink))] hover:border-[hsl(var(--browse-accent))]"
                )}
              >
                {c.emoji ? `${c.emoji} ` : ""}{c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-[290px] animate-pulse rounded-xl border border-[hsl(var(--browse-line))] bg-white/60" />
              ))
            : filtered.map((l) => {
                const name = l.display_name ?? "Member";
                return (
                  <article
                    key={l.id}
                    className="overflow-hidden rounded-xl border border-[hsl(var(--browse-line))] bg-white transition-smooth hover:shadow-card"
                  >
                    <div className="flex h-[120px] items-center justify-center border-b border-[hsl(var(--browse-line))] bg-white text-4xl">
                      {CATEGORY_EMOJI[l.category] ?? "✨"}
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--browse-accent))]">
                        {l.category}
                      </p>
                      <h3 className="mt-1.5 font-serif text-base text-[hsl(var(--browse-ink))]">{l.title}</h3>
                      <p className="mt-1.5 line-clamp-1 text-xs text-[hsl(var(--browse-muted))]">
                        {l.description ?? ""}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--browse-line))] bg-white text-[10px] font-semibold text-[hsl(var(--browse-accent))]">
                            {initialOf(name)}
                          </span>
                          <span className="truncate text-xs text-[hsl(var(--browse-ink))]">{name}</span>
                        </div>
                        <span className="shrink-0 rounded-full border border-[hsl(var(--browse-line))] bg-white px-3 py-1 text-[11px] font-bold text-[hsl(var(--browse-ink))]">
                          {l.point_price} cr
                        </span>
                      </div>

                      <Link
                        to="/matches"
                        className="mt-4 flex h-10 items-center justify-center rounded-lg border border-[hsl(var(--browse-line))] text-xs font-semibold text-[hsl(var(--browse-accent))] transition-smooth hover:bg-[hsl(var(--browse-bg))]"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                );
              })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="mt-8 rounded-xl border border-[hsl(var(--browse-line))] bg-white px-6 py-12 text-center">
            <p className="font-serif text-lg text-[hsl(var(--browse-ink))]">No services yet</p>
            <p className="mt-1 text-sm text-[hsl(var(--browse-muted))]">Be the first to share a skill with the community.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PremiumExploreFeed;
