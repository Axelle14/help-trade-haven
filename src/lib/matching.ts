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
