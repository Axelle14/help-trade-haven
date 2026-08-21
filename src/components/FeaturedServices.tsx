import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const FeaturedServices = () => {
  const { user } = useAuth();
  const [active, setActive] = useState("All");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("browse_services", {
        _user_city_id: null,
        _limit: 30,
      });
      if (cancelled) return;
      if (!error) setListings((data ?? []) as Listing[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const base = active === "All" ? listings : listings.filter((l) => l.category === active);
    return base.slice(0, 6);
  }, [listings, active]);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="browse-theme py-10 md:py-16">
      <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl md:text-[2rem] leading-tight text-[hsl(var(--browse-ink))]">
            Browse <span className="italic text-[hsl(var(--browse-accent))]">Services</span>
          </h2>
          <Link
            to="/explore"
            className="shrink-0 text-sm font-semibold text-[hsl(var(--browse-accent))] hover:opacity-80"
          >
            See all
          </Link>
        </div>

        {/* Category pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = active === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActive(c.label)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-smooth",
                  isActive
                    ? "border-transparent bg-[hsl(var(--browse-ink))] text-white"
                    : "border-[hsl(var(--browse-line))] bg-white text-[hsl(var(--browse-ink))] hover:border-[hsl(var(--browse-accent))]"
                )}
              >
                {c.emoji ? `${c.emoji} ` : ""}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[290px] animate-pulse rounded-xl border border-[hsl(var(--browse-line))] bg-white/60"
                />
              ))
            : filtered.map((l) => {
                const name = l.display_name ?? "Member";
                return (
                  <article
                    key={l.id}
                    className="overflow-hidden rounded-xl border border-[hsl(var(--browse-line))] bg-white transition-smooth hover:shadow-card"
                  >
                    <div className="flex h-[120px] items-center justify-center bg-[hsl(var(--browse-tile))] text-4xl">
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
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--browse-tile))] text-[10px] font-semibold text-[hsl(var(--browse-accent))]">
                            {initialOf(name)}
                          </span>
                          <span className="truncate text-xs text-[hsl(var(--browse-ink))]">{name}</span>
                        </div>
                        <span className="shrink-0 rounded-full bg-[hsl(var(--browse-tile))] px-3 py-1 text-[11px] font-bold text-[hsl(var(--browse-ink))]">
                          {l.point_price} cr
                        </span>
                      </div>

                      <Link
                        to="/explore"
                        className="mt-4 flex h-10 items-center justify-center rounded-lg border border-[hsl(var(--browse-line))] text-xs font-semibold text-[hsl(var(--browse-accent))] transition-smooth hover:bg-[hsl(var(--browse-tile))]"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
