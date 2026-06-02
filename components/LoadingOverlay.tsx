"use client";

import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/loading-messages";

export default function LoadingOverlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="mog-outline mog-stripe-texture flex flex-col items-center justify-center gap-6 rounded-xl px-8 py-14"
      style={{ backgroundColor: "var(--mog-paper-alt)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-14 w-14 animate-spin rounded-full border-4 border-black/30"
        style={{ borderTopColor: "var(--mog-gold)" }}
        role="status"
        aria-label="Cargando"
      />
      <p className="min-h-[3rem] text-center font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-[var(--mog-gold)]">
        {LOADING_MESSAGES[index]}
      </p>
      <span className="mog-stamp text-[10px] font-bold opacity-90">
        En revisión
      </span>
    </div>
  );
}
