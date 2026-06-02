export const MOG_INTENSITIES = ["roast", "savage", "nuclear"] as const;

export type MogIntensity = (typeof MOG_INTENSITIES)[number];

export type MogRankingEntry = {
  name: string;
  score: number;
  reason: string;
  archetype?: string;
};

export type MogResult = {
  winner: string;
  score: number;
  confidence: number;
  roast: string;
  ranking: MogRankingEntry[];
  evidence: string[];
  limits: string | null;
};
