// =============================================================================
// SLOT de Frontend #4 (Verdict) — versión PLACEHOLDER de Platform/QA
// =============================================================================
// Stub funcional para correr end-to-end contra el mock.
// El owner #4 REEMPLAZA el interior con la VerdictCard real (podio estilizado,
// medidor de confianza, animaciones, etc.). También dueño de ErrorState.
//
// CONTRATO QUE NO DEBE CAMBIAR (para no romper app/page.tsx):
//   props: { verdict: AlphaVerdict, onReset: () => void }
// =============================================================================
"use client";

import type { AlphaVerdict } from "@/lib/types";

interface VerdictCardProps {
  verdict: AlphaVerdict;
  onReset: () => void;
}

export default function VerdictCard({ verdict, onReset }: VerdictCardProps) {
  function copyShare() {
    navigator.clipboard.writeText(verdict.share_text).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-amber-400/30 bg-white/5 p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400/70">
          Veredicto oficial · confianza {verdict.confidence}%
        </p>
        <h2 className="mt-1 text-3xl font-black">🏆 {verdict.winner}</h2>
        <p className="text-sm italic text-white/60">{verdict.award_title}</p>
      </div>

      <p className="leading-relaxed text-white/90">{verdict.roast}</p>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white/70">Podio</h3>
        <ol className="flex flex-col gap-1 text-sm">
          {verdict.ranking.map((r) => (
            <li key={r.rank} className="flex justify-between gap-3">
              <span>
                {r.rank}. <strong>{r.name}</strong> — {r.one_liner}
              </span>
              <span className="shrink-0 text-amber-400">{r.alpha_score}</span>
            </li>
          ))}
        </ol>
      </div>

      {verdict.funniest_moment && (
        <p className="rounded-md bg-black/30 p-3 text-sm text-white/70">
          😂 {verdict.funniest_moment}
        </p>
      )}

      <p className="text-xs text-white/40">Límites: {verdict.limits}</p>

      <div className="flex gap-3">
        <button
          onClick={copyShare}
          className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black"
        >
          Copiar veredicto
        </button>
        <button
          onClick={onReset}
          className="rounded-lg border border-white/20 px-4 py-2 font-semibold"
        >
          Evaluar otra
        </button>
      </div>
    </div>
  );
}
