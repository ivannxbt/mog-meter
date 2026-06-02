import type { MogRankingEntry } from "@/lib/mog-types";

const GOLD = "#F59E0B";

type PhotoRankingOverlayProps = {
  src: string;
  ranking: MogRankingEntry[];
  /** Orden espacial: el #1 (mayor score) se coloca a la derecha de la foto */
  spatialRightToLeft?: boolean;
};

/** Coloca el ranking sobre la imagen (derecha = puesto 1 cuando spatialRightToLeft). */
export default function PhotoRankingOverlay({
  src,
  ranking,
  spatialRightToLeft = true,
}: PhotoRankingOverlayProps) {
  const sorted = [...ranking].sort((a, b) => b.score - a.score);
  const n = sorted.length;

  if (n === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Imagen analizada" className="w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <div className="relative bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Ranking sobre la foto"
          className="max-h-[min(70vh,520px)] w-full object-contain"
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-2 flex h-24 items-end justify-between px-1 sm:px-2">
          {sorted.map((entry, i) => {
            const rank = i + 1;
            const leftPercent = spatialRightToLeft
              ? n === 1
                ? 50
                : 88 - (i / Math.max(n - 1, 1)) * 76
              : ((i + 0.5) / n) * 100;

            const isWinner = rank === 1;

            return (
              <div
                key={`${entry.name}-${i}`}
                className="absolute bottom-2 flex max-w-[28%] -translate-x-1/2 flex-col items-center gap-0.5"
                style={{ left: `${leftPercent}%` }}
              >
                <div
                  className="flex flex-col items-center rounded-lg px-1.5 py-1 text-center shadow-lg sm:px-2 sm:py-1.5"
                  style={{
                    backgroundColor: isWinner ? GOLD : "rgba(24,24,27,0.92)",
                    color: isWinner ? "#0a0a0a" : "#fafafa",
                    border: isWinner
                      ? "2px solid #FFD700"
                      : "1px solid rgba(245,158,11,0.45)",
                    minWidth: "3.25rem",
                  }}
                >
                  <span className="text-[10px] font-bold uppercase leading-none opacity-80">
                    #{rank}
                    {isWinner ? " 🏆" : ""}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-tight sm:text-xs">
                    {entry.name}
                  </span>
                  <span
                    className="text-xs font-black tabular-nums sm:text-sm"
                    style={{ color: isWinner ? "#0a0a0a" : GOLD }}
                  >
                    {entry.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {spatialRightToLeft && n > 1 && (
          <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-zinc-400">
            ← izquierda · derecha →
          </div>
        )}
      </div>
    </div>
  );
}
