"use client";

import { useState } from "react";
import type { AlphaVerdict, EvidenceEntry, RankingEntry } from "@/lib/types";
import FutPlayerCard from "@/components/verdict/FutPlayerCard";
import LowSignalBanner from "@/components/verdict/LowSignalBanner";

interface VerdictCardProps {
  verdict: AlphaVerdict;
  onReset: () => void;
}

const LOW_CONFIDENCE_THRESHOLD = 40;

export default function VerdictCard({ verdict, onReset }: VerdictCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const isLowSignal = verdict.confidence < LOW_CONFIDENCE_THRESHOLD;
  const winnerEntry =
    verdict.ranking.find((r) => r.rank === 1) ??
    ({
      rank: 1,
      name: verdict.winner,
      alpha_score: 50,
      one_liner: verdict.award_title,
    } satisfies RankingEntry);

  const podiumRest = verdict.ranking
    .filter((r) => r.rank > 1)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 2);

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(verdict.share_text);
      setCopyState("ok");
    } catch {
      setCopyState("fail");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="relative text-center">
        <span
          className="mog-stamp absolute -right-1 top-0 hidden text-[9px] sm:inline-block"
          aria-hidden
        >
          Certificado
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--mog-gold)]">
          Informe oficial · humor corporativo
        </p>
        <h2 className="mog-title-3d mt-2 font-[family-name:var(--font-display)] text-4xl uppercase sm:text-5xl">
          Veredicto MOG
        </h2>
      </header>

      {isLowSignal && (
        <LowSignalBanner
          confidence={verdict.confidence}
          limits={verdict.limits}
        />
      )}

      <FutPlayerCard
        entry={winnerEntry}
        tier="gold"
        awardTitle={verdict.award_title}
        size="hero"
      />

      {podiumRest.length > 0 && (
        <div>
          <h3 className="mb-3 text-center font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-white/90">
            Podio
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {podiumRest.map((entry) => (
              <FutPlayerCard
                key={entry.rank}
                entry={entry}
                tier={entry.rank === 2 ? "silver" : "bronze"}
              />
            ))}
          </div>
        </div>
      )}

      <section
        className="mog-outline mog-stripe-texture rounded-xl px-4 py-4"
        style={{ backgroundColor: "var(--mog-forest)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--mog-gold)]">
          Confianza del jurado
        </p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-[family-name:var(--font-display)] text-2xl text-white">
            {verdict.confidence}%
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-sm border-2 border-black bg-black/40">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, verdict.confidence))}%`,
              background:
                "linear-gradient(90deg, var(--mog-gold-mid), var(--mog-gold-light))",
            }}
          />
        </div>
      </section>

      <blockquote
        className="mog-outline rounded-xl px-4 py-4 text-base italic leading-relaxed text-white"
        style={{
          backgroundColor: "var(--mog-paper-alt)",
          borderLeft: "6px solid var(--mog-gold)",
        }}
      >
        {verdict.roast}
      </blockquote>

      {verdict.funniest_moment && (
        <p
          className="mog-outline rounded-lg px-4 py-3 text-sm text-white/85"
          style={{ backgroundColor: "rgba(245, 196, 0, 0.12)" }}
        >
          <span className="font-bold text-[var(--mog-gold)]">Momento peak:</span>{" "}
          {verdict.funniest_moment}
        </p>
      )}

      {verdict.evidence.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-[var(--mog-gold)]">
            Evidencia documentada
          </h3>
          <ul className="flex flex-col gap-3">
            {verdict.evidence.map((block: EvidenceEntry) => (
              <li
                key={block.name}
                className="mog-outline mog-stripe-texture rounded-lg px-3 py-3"
                style={{ backgroundColor: "var(--mog-paper)" }}
              >
                <p className="font-bold text-white">{block.name}</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-white/75">
                  {block.observations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isLowSignal && verdict.limits && (
        <p className="text-center text-xs text-white/45">
          Límites: {verdict.limits}
        </p>
      )}

      {verdict.safety_flags.length > 0 && (
        <p className="text-center text-xs text-[var(--mog-netflix)]">
          Flags: {verdict.safety_flags.join(", ")}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={copyShare}
          className="mog-outline flex-1 rounded-xl py-3 font-bold uppercase tracking-wide transition hover:brightness-110"
          style={{ backgroundColor: "var(--mog-gold)", color: "#0a0a0a" }}
        >
          Copiar veredicto
        </button>
        <button
          type="button"
          onClick={onReset}
          className="mog-outline flex-1 rounded-xl border-[var(--mog-gold)] bg-transparent py-3 font-semibold text-[var(--mog-gold)] transition hover:bg-black/20"
        >
          Evaluar otra
        </button>
      </div>

      {copyState === "ok" && (
        <p className="-mt-1 text-center text-xs text-[var(--mog-gold)]">
          ¡Copiado al portapapeles!
        </p>
      )}
      {copyState === "fail" && (
        <p className="-mt-1 text-center text-xs text-[var(--mog-netflix)]">
          No se pudo copiar. Selecciona el texto manualmente.
        </p>
      )}
    </div>
  );
}
