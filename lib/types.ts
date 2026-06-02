// =============================================================================
// MOG Meter — Shared Contract (PRD §10)
// =============================================================================
// Este archivo es el "idioma común" entre los 5 workstreams.
// Frontend (#3 upload, #4 verdict) y Backend (#1) programan CONTRA estos tipos.
// Si cambias algo aquí, avisa al equipo: rompe el contrato para todos.
//
// Regla de oro: nadie inventa formas de datos por su cuenta. Todo pasa por aquí.
// =============================================================================

// ----------------------------------------------------------------------------
// REQUEST  (lo que el navegador envía a /api/evaluate-alpha)
// ----------------------------------------------------------------------------
// La imagen viaja como archivo en multipart/form-data, no en este objeto.
// Estos son los campos de texto que la acompañan.

/** Nivel de "roast" (qué tan picante es el veredicto). Default: "ligero". */
export type RoastIntensity = "ligero" | "medio" | "picante";

/** Formatos de imagen aceptados (PRD FR-2). */
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

/** Tamaño máximo de archivo en bytes (PRD FR-3 → 8 MB). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Largo máximo del campo de contexto opcional (PRD FR-5). */
export const MAX_CONTEXT_CHARS = 500;

/** Campos de texto que acompañan a la imagen en el form-data. */
export interface EvaluateRequestFields {
  /** Contexto opcional: nombres de participantes, vibe, etc. */
  context?: string;
  /** Intensidad del roast. Si falta, el backend asume "ligero". */
  intensity?: RoastIntensity;
}

// ----------------------------------------------------------------------------
// RESPONSE — ÉXITO  (PRD §10, status 200)
// ----------------------------------------------------------------------------
// OJO: "low confidence" NO es un error. Es un 200 con confidence baja y
// `limits` explicando por qué (PRD FR-10 / US-6).

/** Una persona dentro del ranking del podio. */
export interface RankingEntry {
  /** Posición en el podio (1 = el macho alfa). */
  rank: number;
  /** Nombre/handle tal como aparece en el screenshot. */
  name: string;
  /** Puntaje alfa 0–100 (puramente cómico, no científico). */
  alpha_score: number;
  /** Frase de una línea que resume a esta persona. */
  one_liner: string;
}

/** Evidencia (cómica) por persona, basada SOLO en comportamiento visible. */
export interface EvidenceEntry {
  /** Nombre/handle de la persona. */
  name: string;
  /** Observaciones de comportamiento visible (turnos, interrupciones, etc.). */
  observations: string[];
}

/** Veredicto completo devuelto por el backend cuando todo sale bien. */
export interface AlphaVerdict {
  /** Nombre/handle del ganador (el "macho alfa" de la reunión). */
  winner: string;
  /** Podio ordenado por rank. */
  ranking: RankingEntry[];
  /** Evidencia por persona. */
  evidence: EvidenceEntry[];
  /** El párrafo principal del roast (ES / Spanglish). */
  roast: string;
  /** Confianza 0–100. Baja = el modelo no vio señal clara (FR-10). */
  confidence: number;
  /** Premio corporativo de mentira, p. ej. "Director Regional de Interrumpir". */
  award_title: string;
  /** El momento más gracioso detectado, o null si no hubo. */
  funniest_moment: string | null;
  /** Texto compacto y copiable para compartir (PRD FR-12). */
  share_text: string;
  /** Qué NO pudo determinar el modelo (honestidad sobre los límites). */
  limits: string;
  /** Banderas de seguridad levantadas durante la generación (§12). */
  safety_flags: string[];
}

// ----------------------------------------------------------------------------
// RESPONSE — ERROR  (PRD §10, status 4xx / 5xx)
// ----------------------------------------------------------------------------

/** Códigos de error estables que el frontend mapea a mensajes amigables. */
export type ApiErrorCode =
  | "INVALID_TYPE" // tipo de archivo no permitido (FR-2)
  | "FILE_TOO_LARGE" // supera MAX_IMAGE_BYTES (FR-3)
  | "MISSING_IMAGE" // no se envió imagen (FR-14)
  | "RATE_LIMITED" // demasiadas peticiones (NFR-4)
  | "LLM_ERROR" // falló la llamada al modelo
  | "SCHEMA_ERROR" // el modelo devolvió algo que no cumple el esquema
  | "INTERNAL"; // cualquier otro fallo no previsto

/** Cuerpo de respuesta de error (PRD §10). */
export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    /** Mensaje legible para mostrar al usuario directamente. */
    message: string;
  };
}

// ----------------------------------------------------------------------------
// UNIÓN DE RESPUESTA
// ----------------------------------------------------------------------------
// El frontend recibe una de estas dos. Usa `isApiError` para distinguir.

export type EvaluateResponse = AlphaVerdict | ApiErrorResponse;

/** Type guard: ¿la respuesta es un error? (estrecha el tipo en TS). */
export function isApiError(res: EvaluateResponse): res is ApiErrorResponse {
  return (res as ApiErrorResponse).error !== undefined;
}
