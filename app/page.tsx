"use client";

import { useState } from "react";
import {
  isApiError,
  type AlphaVerdict,
  type EvaluateRequestFields,
} from "@/lib/types";
import Disclaimer from "@/components/Disclaimer";
import ErrorState from "@/components/ErrorState";
import LoadingOverlay from "@/components/LoadingOverlay";
import UploadPanel from "@/components/upload/UploadPanel";
import VerdictCard from "@/components/verdict/VerdictCard";

type UiState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; verdict: AlphaVerdict }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<UiState>({ phase: "idle" });

  async function handleSubmit(image: File, fields: EvaluateRequestFields) {
    setState({ phase: "loading" });

    const body = new FormData();
    body.append("image", image);
    if (fields.context) body.append("context", fields.context);
    if (fields.intensity) body.append("intensity", fields.intensity);

    try {
      const res = await fetch("/api/evaluate-alpha", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (isApiError(data)) {
        setState({ phase: "error", message: data.error.message });
        return;
      }
      setState({ phase: "result", verdict: data });
    } catch {
      setState({
        phase: "error",
        message: "No pude conectar con el servidor. Revisa tu conexión.",
      });
    }
  }

  function reset() {
    setState({ phase: "idle" });
  }

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-8 sm:py-10">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mog-gold)]">
            Evaluador Macho Alfa · informe no oficial
          </p>
          <h1 className="mog-title-3d mt-2 font-[family-name:var(--font-display)] text-5xl uppercase sm:text-6xl">
            MOG Meter
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            ¿Quién es el Male Of the Group? Sube una captura de WhatsApp o Teams
            y descúbrelo. Sin arrepentimientos (casi).
          </p>
        </header>

        <Disclaimer variant="hero" />

        {state.phase === "loading" && <LoadingOverlay />}

        {state.phase === "idle" && (
          <UploadPanel onSubmit={handleSubmit} isLoading={false} />
        )}

        {state.phase === "result" && (
          <div aria-live="polite">
            <VerdictCard verdict={state.verdict} onReset={reset} />
          </div>
        )}

        {state.phase === "error" && (
          <ErrorState message={state.message} onRetry={reset} />
        )}

        <footer className="mt-auto pt-2">
          <Disclaimer variant="footer" />
        </footer>
      </main>
    </div>
  );
}
