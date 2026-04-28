// Reward system logic for Service Swap

export type BadgeTier = "Beginner" | "Trusted" | "Expert" | "Legend";

export interface Badge {
  tier: BadgeTier;
  minPoints: number;
  maxPoints: number | null;
  perks: string[];
  description: string;
}

export const BADGES: Badge[] = [
  {
    tier: "Beginner",
    minPoints: 0,
    maxPoints: 100,
    description: "Just getting started — every swap counts.",
    perks: ["Welcome badge", "Access to community feed"],
  },
  {
    tier: "Trusted",
    minPoints: 100,
    maxPoints: 250,
    description: "Building a reputation across the community.",
    perks: ["Priority matching", "Verified-in-progress badge"],
  },
  {
    tier: "Expert",
    minPoints: 250,
    maxPoints: 500,
    description: "A go-to swapper others rely on.",
    perks: ["Verified badge", "Featured in search", "Lower platform fees"],
  },
  {
    tier: "Legend",
    minPoints: 500,
    maxPoints: null,
    description: "Top-tier community member shaping Service Swap.",
    perks: ["Featured profile", "Early access to features", "Legend crown"],
  },
];

// Point rules
export const POINT_RULES = {
  COMPLETE_SWAP: 100,
  FIVE_STAR_REVIEW: 50,
  RECEIVE_REVIEW: 20,
  REFERRAL_SIGNUP: 150,
  REFERRAL_FIRST_SWAP: 300,
  PROFILE_COMPLETE: 75,
  VERIFY_IDENTITY: 100,
} as const;

export type PointAction = keyof typeof POINT_RULES;

export const awardPoints = (action: PointAction): number => POINT_RULES[action];

export const getCurrentBadge = (points: number): Badge => {
  return [...BADGES].reverse().find((b) => points >= b.minPoints) ?? BADGES[0];
};

export const getNextBadge = (points: number): Badge | null => {
  return BADGES.find((b) => b.minPoints > points) ?? null;
};

export interface ProgressInfo {
  current: Badge;
  next: Badge | null;
  pointsIntoTier: number;
  pointsForNext: number;
  percent: number;
}

export const getProgress = (points: number): ProgressInfo => {
  const current = getCurrentBadge(points);
  const next = getNextBadge(points);
  const pointsIntoTier = points - current.minPoints;
  const pointsForNext = next ? next.minPoints - points : 0;
  const tierSpan = next ? next.minPoints - current.minPoints : 1;
  const percent = next ? Math.min(100, (pointsIntoTier / tierSpan) * 100) : 100;
  return { current, next, pointsIntoTier, pointsForNext, percent };
};

export const generateReferralCode = (userId: string): string => {
  const seed = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `SWAP-${seed}`;
};
