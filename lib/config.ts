// =============================================================================
// MOG Meter — Platform config (workstream #5)
// =============================================================================
// Límites compartidos: rate limiting, techo de coste LLM, preprocess de imagen.
// Backend (#1) importa estas constantes; el mock las respeta donde aplica.
// =============================================================================

/** Per-IP rate limit (PRD NFR-4). */
export const RATE_LIMIT = {
  /** Máximo de evaluaciones por ventana. */
  maxRequests: 10,
  /** Ventana deslizante (sintaxis @upstash/ratelimit). */
  window: "5 m" as const,
  /** Prefijo de clave Redis. */
  keyPrefix: "mog:evaluate-alpha",
} as const;

/** Techo de coste por petición (PRD NFR-3). Backend aplica al llamar OpenAI. */
export const COST_CEILING = {
  /** Tokens máximos de salida en Responses API. */
  maxOutputTokens: 1500,
  /** Lado largo máximo tras preprocess con sharp. */
  maxImageLongEdgePx: 1536,
  /** Calidad JPEG tras downscale. */
  imageJpegQuality: 85,
  /** Detail en input_image (menor coste de visión). */
  imageDetail: "low" as const,
  /** Modelo por defecto si OPENAI_MODEL no está definido. */
  defaultModel: "gpt-4.1-mini",
} as const;

/** Latencia simulada del mock (ms) para probar estados de carga. */
export const MOCK_LATENCY_MS = 700;
