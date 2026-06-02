"use client";

import type { CSSProperties } from "react";
import type { RankingEntry } from "@/lib/types";
import { deriveFutStats, truncateAward } from "@/lib/verdict-stats";

export type CardTier = "gold" | "silver" | "bronze";

const TIER_VARS: Record<
  CardTier,
  { dark: string; mid: string; light: string; inner: string }
> = {
  gold: {
    dark: "#c9960c",
    mid: "#f5c400",
    light: "#f5e070",
    inner: "#1a1408",
  },
  silver: {
    dark: "#8a8a8a",
    mid: "#c0c0c0",
    light: "#e8e8e8",
    inner: "#141418",
  },
  bronze: {
    dark: "#8b4513",
    mid: "#cd7f32",
    light: "#e8a86a",
    inner: "#1a1008",
  },
};

interface FutPlayerCardProps {
  entry: RankingEntry;
  tier: CardTier;
  awardTitle?: string;
  size?: "hero" | "compact";
}

export default function FutPlayerCard({
  entry,
  tier,
  awardTitle,
  size = "compact",
}: FutPlayerCardProps) {
  const palette = TIER_VARS[tier];
  const stats = deriveFutStats(entry);
  const position = awardTitle
    ? truncateAward(awardTitle, size === "hero" ? 36 : 28)
    : entry.one_liner.slice(0, 28);

  const isHero = size === "hero";

  return (
    <article
      className={`fut-card-tilt fut-card-frame mog-outline overflow-hidden rounded-lg ${isHero ? "w-full max-w-sm mx-auto" : "w-full"}`}
      style={
        {
          "--tier-dark": palette.dark,
          "--tier-mid": palette.mid,
          "--tier-light": palette.light,
        } as CSSProperties
      }
    >
      <div
        className="mog-stripe-texture flex flex-col p-1.5"
        style={{ backgroundColor: palette.inner }}
      >
        <div className="relative flex flex-col rounded-sm border-2 border-black/80 bg-[#0f0d0a]">
          <div
            className={`relative flex items-start justify-between gap-2 border-b-2 border-black/60 px-3 pt-3 ${isHero ? "min-h-[140px]" : "min-h-[100px]"}`}
            style={{
              background: `linear-gradient(180deg, ${palette.mid}22 0%, transparent 70%)`,
            }}
          >
            <div className="z-10 shrink-0">
              <p
                className={`font-[family-name:var(--font-display)] font-normal leading-none text-[var(--mog-gold)] ${isHero ? "text-6xl sm:text-7xl" : "text-4xl"}`}
                style={{
                  color: palette.light,
                  textShadow: "2px 2px 0 #000",
                }}
              >
                {entry.alpha_score}
              </p>
              <p
                className="mt-0.5 max-w-[7rem] text-[10px] font-bold uppercase leading-tight tracking-wide text-white/85"
                title={awardTitle ?? entry.one_liner}
              >
                {position}
              </p>
            </div>

            <div
              className={`flex flex-1 flex-col items-center justify-end pb-2 ${isHero ? "pt-2" : "pt-1"}`}
              aria-hidden
            >
              <div
                className={`flex items-center justify-center rounded-full border-2 border-black/70 bg-gradient-to-b from-zinc-600 to-zinc-900 ${isHero ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14"}`}
              >
                <span
                  className={`font-[family-name:var(--font-display)] text-white/90 ${isHero ? "text-4xl" : "text-2xl"}`}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p
                className={`mt-2 text-center font-[family-name:var(--font-display)] uppercase tracking-wide text-white ${isHero ? "text-xl sm:text-2xl" : "text-sm"}`}
              >
                {entry.name}
              </p>
            </div>

            <span
              className="absolute right-2 top-2 rounded border border-black/60 bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white/80"
            >
              #{entry.rank}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-2.5 py-2 text-[10px] font-semibold text-white/90">
            <StatColumn stats={stats.left} accent={palette.light} />
            <StatColumn stats={stats.right} accent={palette.light} />
          </div>
        </div>
      </div>
    </article>
  );
}

function StatColumn({
  stats,
  accent,
}: {
  stats: { label: string; value: number }[];
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1.5">
          <span className="w-7 shrink-0 text-white/55">{stat.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-black/50">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${stat.value}%`,
                backgroundColor: accent,
              }}
            />
          </div>
          <span className="w-5 text-right tabular-nums">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
