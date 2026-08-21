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
    return base.slice(0, 4);
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
                {c.emoji ? `${c.emoji} ` : ""}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[240px] animate-pulse rounded-xl border border-[hsl(var(--browse-line))] bg-white/60"
                />
              ))
            : filtered.map((l) => {
                const name = l.display_name ?? "Member";
                return (
                  <article
                    key={l.id}
                    className="overflow-hidden rounded-xl border border-[hsl(var(--browse-line))] bg-white transition-smooth hover:shadow-card"
                  >
                    <div className="flex h-[90px] items-center justify-center border-b border-[hsl(var(--browse-line))] bg-white text-3xl">
                      {CATEGORY_EMOJI[l.category] ?? "✨"}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--browse-accent))]">
                        {l.category}
                      </p>
                      <h3 className="mt-1 font-serif text-sm text-[hsl(var(--browse-ink))]">{l.title}</h3>
                      <p className="mt-1 line-clamp-1 text-[11px] text-[hsl(var(--browse-muted))]">
                        {l.description ?? ""}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--browse-line))] bg-white text-[9px] font-semibold text-[hsl(var(--browse-accent))]">
                            {initialOf(name)}
                          </span>
                          <span className="truncate text-[11px] text-[hsl(var(--browse-ink))]">{name}</span>
                        </div>
                        <span className="shrink-0 rounded-full border border-[hsl(var(--browse-line))] bg-white px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--browse-ink))]">
                          {l.point_price} cr
                        </span>
                      </div>

                      <Link
                        to="/explore"
                        className="mt-3 flex h-8 items-center justify-center rounded-lg border border-[hsl(var(--browse-line))] text-[11px] font-semibold text-[hsl(var(--browse-accent))] transition-smooth hover:bg-[hsl(var(--browse-bg))]"
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
