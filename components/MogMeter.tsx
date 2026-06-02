"use client";

import {
  MOG_INTENSITIES,
  type MogIntensity,
  type MogResult,
} from "@/lib/mog-types";
import { validateImageFile } from "@/lib/upload-validation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "loading" | "result";

const GOLD = "#F59E0B";
const BG = "#0a0a0a";

const CONFETTI_CDN =
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";

const LOADING_MESSAGES = [
  "Midiendo egos...",
  "Calculando poder social...",
  "El jurado está deliberando...",
  "Detectando alpha behaviour...",
  "Procesando cringe...",
] as const;

const INTENSITY_LABELS: Record<MogIntensity, string> = {
  roast: "Roast",
  savage: "Savage",
  nuclear: "Nuclear",
};

const API_ERROR_MESSAGES: Record<string, string> = {
  FILE_TOO_LARGE: "La imagen no puede superar 8 MB.",
  INVALID_TYPE: "Solo se permiten imágenes JPG, PNG o WebP.",
  INVALID_IMAGE: "Esa imagen no se pudo leer. Prueba con otra captura (JPG, PNG o WebP).",
  LLM_ERROR: "No se pudo generar el veredicto. Inténtalo de nuevo.",
};

function buildShareText(result: MogResult): string {
  return `🏆 El MOG es ${result.winner} con ${result.score}/100. ${result.roast} — mogmeter.com`;
}

function fireConfetti() {
  if (typeof window === "undefined" || !window.confetti) return;
  window.confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 35,
    origin: { y: 0.55 },
    colors: ["#FFD700", "#FFFFFF"],
    disableForReducedMotion: true,
  });
}

function Spinner() {
  return (
    <div
      className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700"
      style={{ borderTopColor: GOLD }}
      role="status"
      aria-label="Cargando"
    />
  );
}

export default function MogMeter() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<MogResult | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<MogIntensity>("roast");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [confettiReady, setConfettiReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const confettiFiredFor = useRef<string | null>(null);

  const resetPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const resetToIdle = useCallback(() => {
    resetPreview();
    setPhase("idle");
    setFile(null);
    setPreview(null);
    setResult(null);
    setClientError(null);
    setServerError(null);
    setShareFeedback(null);
    setLoadingMessageIndex(0);
    confettiFiredFor.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetPreview]);

  const applyFile = useCallback(
    (next: File | null) => {
      resetPreview();
      setFile(null);
      setPreview(null);
      setServerError(null);
      setShareFeedback(null);

      if (!next) {
        setClientError(null);
        return;
      }

      const validationError = validateImageFile(next);
      if (validationError) {
        setClientError(validationError);
        return;
      }

      setClientError(null);
      setFile(next);
      setPreview(URL.createObjectURL(next));
    },
    [resetPreview],
  );

  useEffect(() => {
    return () => resetPreview();
  }, [resetPreview]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result" || !result || !confettiReady) return;
    const key = `${result.winner}-${result.score}`;
    if (confettiFiredFor.current === key) return;
    confettiFiredFor.current = key;
    fireConfetti();
  }, [phase, result, confettiReady]);

  async function handleAnalyze() {
    if (!file || clientError) return;

    setPhase("loading");
    setServerError(null);
    setResult(null);
    setShareFeedback(null);
    setLoadingMessageIndex(0);
    confettiFiredFor.current = null;

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("intensity", intensity);
      const res = await fetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        const code = typeof data.error === "string" ? data.error : "";
        setServerError(
          API_ERROR_MESSAGES[code] ?? code ?? "No se pudo analizar la imagen.",
        );
        setPhase("idle");
        return;
      }
      setResult(data as MogResult);
      setPhase("result");
    } catch {
      setServerError("Error de conexión. Inténtalo de nuevo.");
      setPhase("idle");
    }
  }

  async function handleShare() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildShareText(result));
      setShareFeedback("¡Copiado!");
    } catch {
      setShareFeedback("No se pudo copiar.");
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0] ?? null);
  }

  const lowConfidence = result !== null && result.confidence < 40;
  const evidenceItems = (result?.evidence ?? []).slice(0, 3);
  const ranking = result?.ranking ?? [];

  return (
    <>
      <Script
        src={CONFETTI_CDN}
        strategy="lazyOnload"
        onLoad={() => setConfettiReady(true)}
      />

      <main
        className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10"
        style={{ backgroundColor: BG }}
      >
        {/* ——— STATE 1: idle ——— */}
        {phase === "idle" && (
          <div className="flex flex-col gap-6">
            <header className="text-center">
              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: GOLD }}
              >
                MOG Meter 🏆
              </h1>
              <p className="mt-3 text-base text-zinc-400 sm:text-lg">
                Sube el screenshot de tu grupo. Te decimos quién manda.
              </p>
            </header>

            {serverError && (
              <p className="text-center text-sm text-red-400" role="alert">
                {serverError}
              </p>
            )}

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-10 transition-colors"
              style={{
                borderColor: isDragging ? GOLD : "#3f3f46",
                backgroundColor: isDragging ? "rgba(245, 158, 11, 0.08)" : "#141414",
              }}
            >
              <span className="text-4xl" aria-hidden>
                📸
              </span>
              <span className="text-center text-sm text-zinc-300">
                Arrastra tu screenshot aquí o toca para elegir
              </span>
              <span className="text-xs text-zinc-500">JPG, PNG o WebP · máx. 8 MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onInputChange}
              />
            </div>

            {clientError && (
              <p className="text-center text-sm text-red-400" role="alert">
                {clientError}
              </p>
            )}

            {preview && !clientError && (
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Vista previa"
                  className="max-h-56 w-full object-contain"
                  style={{ backgroundColor: "#141414" }}
                />
              </div>
            )}

            <div className="flex gap-2">
              {MOG_INTENSITIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                  style={
                    intensity === level
                      ? { backgroundColor: GOLD, color: BG }
                      : {
                          border: "1px solid #3f3f46",
                          backgroundColor: "#141414",
                          color: "#d4d4d8",
                        }
                  }
                >
                  {INTENSITY_LABELS[level]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || !!clientError}
              className="w-full rounded-xl py-3.5 text-base font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: GOLD, color: BG }}
            >
              Analizar
            </button>
          </div>
        )}

        {/* ——— STATE 2: loading ——— */}
        {phase === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
            <Spinner />
            <p
              className="min-h-[1.5rem] text-center text-lg font-medium text-zinc-300"
              aria-live="polite"
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {/* ——— STATE 3: result ——— */}
        {phase === "result" && result && (
          <div className="flex flex-col gap-6">
            <section
              className="flex flex-col gap-5 rounded-2xl border p-5 sm:p-6"
              style={{
                borderColor: "rgba(245, 158, 11, 0.35)",
                backgroundColor: "#141414",
              }}
              aria-live="polite"
            >
              <p
                className="text-center text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: GOLD }}
              >
                Veredicto oficial
              </p>

              {lowConfidence && (
                <div
                  className="rounded-lg px-3 py-2 text-center text-sm"
                  style={{
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: GOLD,
                  }}
                >
                  ⚠️ Veredicto de baja confianza
                </div>
              )}

              <div className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {result.winner} 🏆
                </p>
                <p
                  className="mt-2 text-6xl font-black tabular-nums sm:text-7xl"
                  style={{ color: GOLD }}
                >
                  {result.score}
                  <span className="text-2xl font-semibold text-zinc-500">/100</span>
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Confianza</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, result.confidence))}%`,
                      backgroundColor: GOLD,
                    }}
                  />
                </div>
              </div>

              <blockquote
                className="rounded-lg px-4 py-3 text-base italic leading-relaxed text-zinc-100"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  borderLeft: `4px solid ${GOLD}`,
                }}
              >
                {result.roast}
              </blockquote>

              {evidenceItems.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Evidencia
                  </h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
                    {evidenceItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ranking.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Ranking
                  </h3>
                  <ol className="space-y-3">
                    {ranking.map((entry, i) => (
                      <li
                        key={`${entry.name}-${i}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-zinc-100">
                            {i + 1}. {entry.name}
                          </span>
                          <span
                            className="shrink-0 text-sm font-bold tabular-nums"
                            style={{ color: GOLD }}
                          >
                            {entry.score}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">{entry.reason}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.limits !== null && result.limits !== "" && (
                <p className="text-center text-xs text-zinc-500">{result.limits}</p>
              )}
            </section>

            <button
              type="button"
              onClick={handleShare}
              className="w-full rounded-xl border py-3 text-sm font-semibold transition-colors hover:bg-zinc-900"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Compartir veredicto
            </button>
            {shareFeedback && (
              <p className="-mt-4 text-center text-xs text-emerald-400">
                {shareFeedback}
              </p>
            )}

            <button
              type="button"
              onClick={resetToIdle}
              className="w-full rounded-xl py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Analizar otro
            </button>
          </div>
        )}
      </main>
    </>
  );
}
