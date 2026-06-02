/** Aviso inline de entretenimiento y privacidad (PRD §12, OQ-4). */
export default function Disclaimer({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  if (variant === "footer") {
    return (
      <p className="text-center text-xs leading-relaxed text-white/35">
        MOG Meter es entretenimiento, no un análisis psicológico ni científico.
        Solo evalúa comportamiento visible en la captura; nunca apariencia ni
        rasgos personales. Tu imagen no se guarda ni se registra.
      </p>
    );
  }

  return (
    <aside
      className="rounded-lg border border-mog-gold/20 bg-mog-paper/80 px-4 py-3 text-xs leading-relaxed text-white/55"
      role="note"
    >
      <strong className="text-mog-gold">Aviso:</strong> esto es un chiste
      corporativo, no un diagnóstico. El veredicto se basa solo en lo que se ve
      en el chat (mensajes, turnos, interrupciones). No juzgamos apariencia,
      género ni nada personal. La captura se procesa en memoria y no se guarda.
    </aside>
  );
}
