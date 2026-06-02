/** Aviso inline de entretenimiento y privacidad (PRD §12, OQ-4). */
export default function Disclaimer({
  variant = "hero",
}: {
  variant?: "hero" | "footer";
}) {
  if (variant === "footer") {
    return (
      <p className="text-center text-xs leading-relaxed text-white/45">
        MOG Meter es entretenimiento, no un análisis psicológico ni científico.
        Solo evalúa comportamiento visible en la captura; nunca apariencia ni
        rasgos personales. Tu imagen no se guarda ni se registra.
      </p>
    );
  }

  return (
    <aside
      className="mog-outline mog-stripe-texture rounded-lg px-4 py-3 text-xs leading-relaxed text-white/70"
      style={{ backgroundColor: "var(--mog-forest)" }}
      role="note"
    >
      <strong className="text-[var(--mog-gold)]">Aviso oficial:</strong> esto es
      un chiste corporativo, no un diagnóstico. El veredicto se basa solo en lo
      que se ve en el chat (mensajes, turnos, interrupciones). No juzgamos
      apariencia, género ni nada personal. La captura se procesa en memoria y
      no se guarda.
    </aside>
  );
}
