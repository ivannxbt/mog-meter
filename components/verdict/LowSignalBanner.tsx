interface LowSignalBannerProps {
  confidence: number;
  limits: string;
}

/** Shown on 200 responses with low confidence (PRD FR-10) — not an error state. */
export default function LowSignalBanner({
  confidence,
  limits,
}: LowSignalBannerProps) {
  return (
    <div
      className="mog-outline mog-stripe-texture flex flex-col gap-2 rounded-lg px-4 py-3"
      style={{
        backgroundColor: "rgba(229, 9, 20, 0.12)",
        borderColor: "var(--mog-netflix)",
      }}
      role="status"
    >
      <p className="text-sm font-bold uppercase tracking-wide text-[var(--mog-netflix)]">
        ⚠ Señal baja · confianza {confidence}%
      </p>
      <p className="text-sm leading-relaxed text-white/80">{limits}</p>
    </div>
  );
}
