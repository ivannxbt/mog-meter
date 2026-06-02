// =============================================================================
// PÁGINA DE ENSAMBLAJE — workstream Platform/QA (de 3)
// =============================================================================
// Esta es la "placa madre" del MVP: la máquina de estados que conecta el
// upload (Frontend) con el endpoint (Backend) y muestra el veredicto.
//
// Es el ÚNICO punto donde todo se junta. Por eso lo toca solo Platform/QA:
// así Frontend y Backend trabajan en sus carpetas sin conflictos de merge.
//
// Estados de la UI:
//   idle    -> mostrando el panel de subida
//   loading -> esperando respuesta del endpoint
//   result  -> veredicto recibido (incluye low-signal, que NO es error)
//   error   -> el endpoint devolvió un ApiErrorResponse
// =============================================================================
"use client";

import { useState } from "react";
import {
  isApiError,
  type AlphaVerdict,
  type EvaluateRequestFields,
} from "@/lib/types";
import Disclaimer from "@/components/Disclaimer";
import UploadPanel from "@/components/upload/UploadPanel";
import VerdictCard from "@/components/verdict/VerdictCard";

type UiState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; verdict: AlphaVerdict }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<UiState>({ phase: "idle" });

  // Envía la imagen + campos al endpoint y enruta la respuesta al estado UI.
  // Nota: habla SOLO con el contrato (lib/types.ts), no sabe si detrás hay
  // un mock o el LLM real. Eso permite el swap limpio cuando Backend termine.
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

  const loading = state.phase === "loading";

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10 sm:py-12">
        <header className="text-center">
          <p className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--mog-gold)]">
            Informe oficial · borrador humorístico
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight sm:text-5xl">
            MOG Meter
          </h1>
          <p className="mt-2 text-sm text-white/60">
            ¿Quién es el Male Of the Group? Sube una captura de WhatsApp o Teams
            y descúbrelo. Sin arrepentimientos (casi).
          </p>
        </header>

        <Disclaimer variant="hero" />

        {(state.phase === "idle" || state.phase === "loading") && (
          <div aria-live="polite" aria-busy={loading}>
            <UploadPanel onSubmit={handleSubmit} isLoading={loading} />
          </div>
        )}

        {state.phase === "result" && (
          <div aria-live="polite">
            <VerdictCard verdict={state.verdict} onReset={reset} />
          </div>
        )}

        {state.phase === "error" && (
        // SLOT temporal de ErrorState (lo reemplaza Frontend con su versión).
        <div className="flex flex-col gap-4 rounded-xl border border-red-400/30 bg-red-400/5 p-6 text-center">
          <p className="text-lg font-semibold">Algo salió mal 😬</p>
          <p className="text-sm text-white/70">{state.message}</p>
          <button
            onClick={reset}
            className="self-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black"
          >
            Reintentar
          </button>
        </div>
        )}

        <footer className="mt-auto pt-4">
          <Disclaimer variant="footer" />
        </footer>
      </main>
    </div>
  );
}
