import type { RankingEntry } from "@/lib/types";

export type FutStat = { label: string; value: number };

/** Six abbreviated FUT-style stats derived from alpha_score (comedic, not scientific). */
export function deriveFutStats(entry: RankingEntry): {
  left: FutStat[];
  right: FutStat[];
} {
  const s = entry.alpha_score;
  const clamp = (n: number) => Math.max(12, Math.min(99, Math.round(n)));

  return {
    left: [
      { label: "VOL", value: clamp(s + 4) },
      { label: "INT", value: clamp(s - 7) },
      { label: "AGD", value: clamp(s - 2) },
    ],
    right: [
      { label: "EMO", value: clamp(s + 1) },
      { label: "DEC", value: clamp(s - 5) },
      { label: "TON", value: clamp(s + 6) },
    ],
  };
}

export function truncateAward(title: string, max = 32): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max - 1).trim()}…`;
}
