"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_CONTEXT_CHARS,
  MAX_IMAGE_BYTES,
  type EvaluateRequestFields,
  type RoastIntensity,
} from "@/lib/types";

interface UploadPanelProps {
  onSubmit: (image: File, fields: EvaluateRequestFields) => void;
  isLoading: boolean;
}

const INTENSITY_OPTIONS: { value: RoastIntensity; label: string; hint: string }[] =
  [
    { value: "ligero", label: "Ligero", hint: "Roast juguetón" },
    { value: "medio", label: "Medio", hint: "Más filo" },
    { value: "picante", label: "Picante", hint: "Sin piedad" },
  ];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPanel({ onSubmit, isLoading }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [intensity, setIntensity] = useState<RoastIntensity>("ligero");
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const revokePreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const applyFile = useCallback(
    (next: File | null) => {
      revokePreview();
      setFile(null);
      setPreview(null);
      setClientError(null);

      if (!next) return;

      if (
        !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(next.type)
      ) {
        setClientError("Solo PNG, JPEG o WebP. Nada de GIFs ni PDFs de la reunión.");
        return;
      }
      if (next.size > MAX_IMAGE_BYTES) {
        setClientError("La captura supera 8 MB. Comprime o recorta y vuelve.");
        return;
      }

      setFile(next);
      setPreview(URL.createObjectURL(next));
    },
    [revokePreview],
  );

  useEffect(() => () => revokePreview(), [revokePreview]);

  function handleSubmit() {
    if (!file || clientError || isLoading) return;
    onSubmit(file, {
      context: context.trim() || undefined,
      intensity,
    });
  }

  return (
    <div
      className={`flex flex-col gap-5 ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={isLoading}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isLoading) applyFile(e.dataTransfer.files[0] ?? null);
        }}
        className="mog-outline mog-stripe-texture flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl px-5 py-10 transition"
        style={{
          backgroundColor: isDragging ? "var(--mog-orange)" : "var(--mog-paper)",
          borderColor: isDragging ? "var(--mog-gold)" : "var(--mog-border)",
        }}
      >
        <span
          className="font-[family-name:var(--font-display)] text-5xl text-[var(--mog-gold)]"
          aria-hidden
        >
          📸
        </span>
        <p className="text-center text-sm font-semibold text-white">
          Arrastra tu screenshot de WhatsApp o Teams
        </p>
        <p className="text-center text-xs text-white/55">
          o toca para elegir · PNG / JPG / WEBP · máx. 8 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={isLoading}
          onChange={(e) => {
            applyFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>

      {clientError && (
        <p className="text-center text-sm font-medium text-[var(--mog-netflix)]" role="alert">
          {clientError}
        </p>
      )}

      {preview && file && !clientError && (
        <div className="mog-outline overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa de la captura"
            className="max-h-52 w-full object-contain"
            style={{ backgroundColor: "#0f0d0a" }}
          />
          <p className="bg-black/40 px-3 py-1.5 text-center text-xs text-white/50">
            {file.name} · {formatBytes(file.size)}
          </p>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--mog-gold)]">
          Contexto (opcional)
        </span>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value.slice(0, MAX_CONTEXT_CHARS))}
          maxLength={MAX_CONTEXT_CHARS}
          rows={2}
          disabled={isLoading}
          placeholder="Nombres, vibe del grupo… (prueba: mock:lowsignal o mock:error)"
          className="mog-outline resize-none rounded-lg border-black bg-[var(--mog-forest)] px-3 py-2 text-sm text-white placeholder:text-white/35"
        />
        <span className="text-right text-[10px] text-white/40">
          {context.length}/{MAX_CONTEXT_CHARS}
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--mog-gold)]">
          Intensidad del roast
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={isLoading}
              onClick={() => setIntensity(opt.value)}
              className="mog-outline flex flex-col items-center rounded-lg px-2 py-2.5 text-center transition"
              style={
                intensity === opt.value
                  ? {
                      backgroundColor: "var(--mog-gold)",
                      color: "#0a0a0a",
                    }
                  : {
                      backgroundColor: "var(--mog-paper-alt)",
                      color: "white",
                    }
              }
              aria-pressed={intensity === opt.value}
            >
              <span className="font-[family-name:var(--font-display)] text-lg uppercase">
                {opt.label}
              </span>
              <span className="text-[10px] opacity-80">{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || !!clientError || isLoading}
        className="mog-outline w-full rounded-xl py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{ backgroundColor: "var(--mog-gold)", color: "#0a0a0a" }}
      >
        Evaluar macho alfa
      </button>
    </div>
  );
}
