interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="mog-outline mog-stripe-texture flex flex-col items-center gap-4 rounded-xl px-6 py-8 text-center"
      style={{ backgroundColor: "var(--mog-paper-alt)" }}
      role="alert"
    >
      <span
        className="mog-stamp inline-block rounded px-3 py-1 text-xs font-bold"
        aria-hidden
      >
        Rechazado
      </span>
      <p className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-wide text-white">
        Algo salió mal
      </p>
      <p className="max-w-md text-sm leading-relaxed text-white/75">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mog-outline rounded-lg bg-[var(--mog-gold)] px-6 py-3 font-bold uppercase tracking-wide text-black transition hover:brightness-110"
      >
        Reintentar
      </button>
    </div>
  );
}
