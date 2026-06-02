// =============================================================================
// SLOT de Frontend #3 (Upload) — versión PLACEHOLDER de Platform/QA
// =============================================================================
// Esto es un stub funcional para que la app corra end-to-end contra el mock.
// El owner #3 REEMPLAZA el interior de este componente con el UploadDropzone
// real (drag&drop, preview, validación cliente, selector de intensidad).
//
// CONTRATO QUE NO DEBE CAMBIAR (para no romper app/page.tsx):
//   props: { onSubmit, isLoading }
//   onSubmit(image: File, fields: EvaluateRequestFields): void
// =============================================================================
"use client";

import { useState } from "react";
import type { EvaluateRequestFields, RoastIntensity } from "@/lib/types";

interface UploadPanelProps {
  onSubmit: (image: File, fields: EvaluateRequestFields) => void;
  isLoading: boolean;
}

export default function UploadPanel({ onSubmit, isLoading }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [intensity, setIntensity] = useState<RoastIntensity>("ligero");

  function handleSubmit() {
    if (!file) return;
    onSubmit(file, { context: context || undefined, intensity });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <label className="text-sm font-medium text-white/70">
        Captura de la reunión (PNG / JPG / WEBP)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:font-semibold file:text-black"
        />
      </label>

      <label className="text-sm font-medium text-white/70">
        Contexto (opcional)
        <input
          type="text"
          maxLength={500}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Nombres, vibe... (tip: escribe mock:lowsignal o mock:error para probar estados)"
          className="mt-2 block w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-white/70">
        Intensidad del roast
        <select
          value={intensity}
          onChange={(e) => setIntensity(e.target.value as RoastIntensity)}
          className="mt-2 block w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="ligero">Ligero (default)</option>
          <option value="medio">Medio</option>
          <option value="picante">Picante</option>
        </select>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="rounded-lg bg-amber-400 px-4 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? "Midiendo egos..." : "Evaluar macho alfa"}
      </button>
    </div>
  );
}
