// Service Swap — simple matching algorithm
// Scores potential partners on 4 weighted signals and returns the top 5.

export interface SwapUser {
  id: string;
  name: string;
  initials: string;
  avatarFrom: string;
  avatarTo: string;
  skillsOffered: string[];
  skillsNeeded: string[];
  /** [latitude, longitude] in decimal degrees */
  location: [number, number];
  city: string;
  /** 0–5 */
  rating: number;
  /** number of completed reviews — used as a small confidence boost */
  reviews: number;
  verified?: boolean;
}

export interface MatchBreakdown {
  /** % of THEIR offers that satisfy MY needs (0–1) */
  theyHelpMe: number;
  /** % of MY offers that satisfy THEIR needs (0–1) */
  iHelpThem: number;
  /** mutual fit, 0–1 — the core "barter works both ways" signal */
  mutualFit: number;
  /** distance in km */
  distanceKm: number;
  /** proximity score 0–1 (1 = same city, decays with distance) */
  proximity: number;
  /** rating score 0–1 (rating/5, with a small reviews-confidence factor) */
  reputation: number;
}

export interface Match {
  user: SwapUser;
  /** integer percentage 0–100 */
  matchPercent: number;
  breakdown: MatchBreakdown;
  /** human-readable shared skills */
  theyOffer: string[];
  iOffer: string[];
}

// Weights — should sum to 1. Mutual fit dominates because barter REQUIRES it.
export const WEIGHTS = {
  mutualFit: 0.55,
  proximity: 0.2,
  reputation: 0.25,
} as const;

const norm = (s: string) => s.trim().toLowerCase();

function overlap(a: string[], b: string[]): string[] {
  const set = new Set(b.map(norm));
  return a.filter((x) => set.has(norm(x)));
}

/** Haversine distance between two [lat, lng] points, in kilometers */
function haversineKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Soft proximity: 1.0 at 0km, ~0.5 at 50km, ~0.1 at 200km, floor 0.05 globally */
function proximityScore(km: number): number {
  return Math.max(0.05, 1 / (1 + km / 50));
}

/** Rating + small confidence bump for users with more reviews (caps quickly) */
function reputationScore(rating: number, reviews: number): number {
  const base = Math.max(0, Math.min(5, rating)) / 5;
  const confidence = Math.min(1, reviews / 25); // saturates at 25 reviews
  return base * (0.85 + 0.15 * confidence);
}

export function scoreMatch(me: SwapUser, them: SwapUser): Match {
  // Mutual skill fit
  const theyOffer = overlap(them.skillsOffered, me.skillsNeeded);
  const iOffer = overlap(me.skillsOffered, them.skillsNeeded);

  const theyHelpMe = me.skillsNeeded.length ? theyOffer.length / me.skillsNeeded.length : 0;
  const iHelpThem = them.skillsNeeded.length ? iOffer.length / them.skillsNeeded.length : 0;
  // Geometric mean rewards two-sided overlap and harshly penalizes one-sided matches.
  const mutualFit = Math.sqrt(theyHelpMe * iHelpThem);

  // Proximity
  const distanceKm = haversineKm(me.location, them.location);
  const proximity = proximityScore(distanceKm);

  // Reputation
  const reputation = reputationScore(them.rating, them.reviews);

  const score =
    WEIGHTS.mutualFit * mutualFit +
    WEIGHTS.proximity * proximity +
    WEIGHTS.reputation * reputation;

  return {
    user: them,
    matchPercent: Math.round(score * 100),
    breakdown: { theyHelpMe, iHelpThem, mutualFit, distanceKm, proximity, reputation },
    theyOffer,
    iOffer,
  };
}

/** Top-N matches for `me` from a candidate pool. Excludes self and zero-fit pairs. */
export function findMatches(me: SwapUser, pool: SwapUser[], topN = 5): Match[] {
  return pool
    .filter((u) => u.id !== me.id)
    .map((u) => scoreMatch(me, u))
    .filter((m) => m.breakdown.mutualFit > 0) // must be a real two-way swap candidate
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, topN);
}

// ──────────────────────────────────────────────────────────────────────────
// Liquidity fallback — tiered cascade so users NEVER see an empty state.
// See /mnt/documents/service-swap-liquidity-strategy.md for full design.
// ──────────────────────────────────────────────────────────────────────────

export type MatchTier =
  | "perfect"
  | "they-help-me"
  | "i-help-them"
  | "learning"
  | "trending"
  | "seed";

export interface TaggedMatch extends Match {
  tier: MatchTier;
}

export const TIER_META: Record<MatchTier, { label: string; blurb: string; cta: string }> = {
  perfect: {
    label: "Perfect swaps for you",
    blurb: "Two-way matches — you both have what the other wants.",
    cta: "Propose a swap",
  },
  "they-help-me": {
    label: "They have what you want",
    blurb: "They offer a skill you need — pitch them something else in return.",
    cta: "Make an offer",
  },
  "i-help-them": {
    label: "They need your skills",
    blurb: "Great chance to earn points and reviews.",
    cta: "Pitch yourself",
  },
  learning: {
    label: "Explore something new",
    blurb: "Same category as skills you want to learn.",
    cta: "Request a session",
  },
  trending: {
    label: "Popular nearby",
    blurb: "Hot services in your area this week.",
    cta: "View service",
  },
  seed: {
    label: "Featured this week",
    blurb: "Curated picks while your local community grows.",
    cta: "View service",
  },
};

/** Optional fields used by Tier 4–7 fallbacks. Safe to omit on existing data. */
export interface SwapUserExtras {
  /** Categories the user wants to learn — used for Tier 4 (learning). */
  interestCategories?: string[];
  /** Category of the service this user offers — used for Tier 4. */
  offerCategory?: string;
  /** Recent activity score — used for Tier 5 (trending). */
  trendingScore?: number;
  /** Curated/admin-seeded listing — used for Tier 7 (cold start). */
  isSeed?: boolean;
}

export type EnrichedSwapUser = SwapUser & SwapUserExtras;

/** Tiered match cascade. Stops adding tiers once we have ≥ minResults unique users. */
export function findMatchesWithFallback(
  me: EnrichedSwapUser,
  pool: EnrichedSwapUser[],
  minResults = 6,
): TaggedMatch[] {
  const results: TaggedMatch[] = [];
  const seen = new Set<string>();
  const candidates = pool.filter((u) => u.id !== me.id);
  const scored = candidates.map((u) => ({ user: u, match: scoreMatch(me, u) }));

  const add = (rows: { user: EnrichedSwapUser; match: Match }[], tier: MatchTier) => {
    for (const r of rows) {
      if (seen.has(r.user.id)) continue;
      seen.add(r.user.id);
      results.push({ ...r.match, tier });
    }
  };

  // Tier 1 — perfect (mutual fit)
  add(
    scored
      .filter(({ match }) => match.breakdown.mutualFit > 0)
      .sort((a, b) => b.match.matchPercent - a.match.matchPercent),
    "perfect",
  );
  if (results.length >= minResults) return results;

  // Tier 2 — they help me (one-sided inbound)
  add(
    scored
      .filter(({ match }) => match.breakdown.theyHelpMe > 0 && match.breakdown.iHelpThem === 0)
      .sort((a, b) => b.match.breakdown.theyHelpMe - a.match.breakdown.theyHelpMe),
    "they-help-me",
  );

  // Tier 3 — I help them (one-sided outbound)
  add(
    scored
      .filter(({ match }) => match.breakdown.iHelpThem > 0 && match.breakdown.theyHelpMe === 0)
      .sort((a, b) => b.match.breakdown.iHelpThem - a.match.breakdown.iHelpThem),
    "i-help-them",
  );
  if (results.length >= minResults) return results;

  // Tier 4 — learning opportunities (category overlap on my interests)
  const interests = new Set((me.interestCategories ?? []).map((c) => c.toLowerCase()));
  if (interests.size > 0) {
    add(
      scored
        .filter(({ user }) => user.offerCategory && interests.has(user.offerCategory.toLowerCase()))
        .sort((a, b) => b.match.breakdown.proximity - a.match.breakdown.proximity),
      "learning",
    );
  }

  // Tier 5 — trending nearby
  add(
    scored
      .filter(({ user }) => (user.trendingScore ?? 0) > 0 && !user.isSeed)
      .sort((a, b) => {
        const ta = (a.user.trendingScore ?? 0) * a.match.breakdown.proximity;
        const tb = (b.user.trendingScore ?? 0) * b.match.breakdown.proximity;
        return tb - ta;
      }),
    "trending",
  );
  if (results.length >= minResults) return results;

  // Tier 7 — seeded listings (cold start safety net)
  add(
    scored.filter(({ user }) => user.isSeed === true),
    "seed",
  );

  return results;
}
