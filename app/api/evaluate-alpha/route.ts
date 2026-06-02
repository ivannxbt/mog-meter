// =============================================================================
// MOCK de /api/evaluate-alpha  (PRD §10)
// =============================================================================
// PROPÓSITO (workstream #5 — Platform/QA):
//   Desbloquear a Frontend #3 (upload) y #4 (verdict) desde el día 1.
//   Este mock valida igual que el endpoint real (tipo/tamaño/imagen faltante)
//   y devuelve veredictos de ejemplo SIN llamar a ningún LLM.
//
// CUANDO #1 (Backend/LLM) tenga listo el endpoint real, reemplaza la lógica
// de generación de abajo por la llamada a OpenAI — el CONTRATO (lib/types.ts)
// no cambia, así que el frontend no se entera del swap.
//
// DISPARADORES DE PRUEBA (para que #4 pruebe todos los estados sin backend):
//   - Escribe en el campo `context` una de estas palabras clave:
//       "mock:lowsignal"  -> devuelve un veredicto de baja confianza (FR-10)
//       "mock:error"      -> devuelve un error 500 LLM_ERROR
//   - O usa el query param: /api/evaluate-alpha?mock=lowsignal | error | ok
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { MOCK_LATENCY_MS } from "@/lib/config";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  type AcceptedImageType,
  type AlphaVerdict,
  type ApiErrorCode,
  type ApiErrorResponse,
  type RoastIntensity,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Pequeño helper para construir respuestas de error con el shape del contrato.
function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}

// ---- Fixtures de ejemplo --------------------------------------------------

// Veredicto "feliz": alta confianza, ranking completo, roast con chiste.
const MOCK_OK: AlphaVerdict = {
  winner: "Roberto",
  ranking: [
    {
      rank: 1,
      name: "Roberto",
      alpha_score: 92,
      one_liner: "Interrumpió tres veces antes de que terminara la agenda.",
    },
    {
      rank: 2,
      name: "Lucía",
      alpha_score: 78,
      one_liner: "Tomó todas las decisiones pero dejó que otros creyeran que opinaban.",
    },
    {
      rank: 3,
      name: "Diego",
      alpha_score: 41,
      one_liner: "Respondió 'ok' y desapareció. Energía de fantasma alfa.",
    },
  ],
  evidence: [
    {
      name: "Roberto",
      observations: [
        "Envió 14 de 30 mensajes visibles.",
        "Cerró el debate con un 'lo hacemos así y ya'.",
        "Usó el emoji de pulgar arriba como sentencia final.",
      ],
    },
    {
      name: "Lucía",
      observations: [
        "Propuso la única acción concreta de la reunión.",
        "Reaccionó a todo, comprometió a nada.",
      ],
    },
  ],
  roast:
    "Roberto, felicidades: ganaste una reunión que nadie sabía que era una competencia. " +
    "Tu estrategia de interrumpir y luego decir 'como decía' es nivel TED Talk corporativo. " +
    "Lucía te dejó ganar porque ya tomó la decisión real hace tres mensajes. Diego, un 'ok' " +
    "no es liderazgo, es un mensaje de carga.",
  confidence: 88,
  award_title: "Director Regional de Interrumpir con Confianza",
  funniest_moment:
    "Roberto escribió 'breve pregunta' y siguió 4 párrafos.",
  share_text:
    "🏆 El macho alfa de esta reunión es ROBERTO — 'Director Regional de Interrumpir con Confianza'. Evaluado por MOG Meter.",
  limits:
    "No pude ver el tono de voz ni quién pagó el café; el veredicto se basa solo en el chat visible.",
  safety_flags: [],
};

// Veredicto de baja señal: el screenshot no daba para más (PRD FR-10 / US-6).
const MOCK_LOW_SIGNAL: AlphaVerdict = {
  winner: "Indeterminado",
  ranking: [
    {
      rank: 1,
      name: "Alguien (no se leía bien)",
      alpha_score: 50,
      one_liner: "El alfa cuántico: está y no está hasta que mandes mejor captura.",
    },
  ],
  evidence: [
    {
      name: "La captura",
      observations: [
        "Texto borroso o sin nombres visibles.",
        "Muy pocos mensajes para inferir comportamiento.",
      ],
    },
  ],
  roast:
    "Honestamente, con esta captura el único alfa soy yo por intentar leerla. " +
    "Mándame algo donde se vean nombres y mensajes y te doy un veredicto digno de difamación.",
  confidence: 18,
  award_title: "Premio a la Captura Más Misteriosa del Trimestre",
  funniest_moment: null,
  share_text:
    "🤷 MOG Meter no pudo coronar a nadie: la captura no daba señal. Reintenta con una más clara.",
  limits:
    "La imagen no tenía nombres legibles ni suficiente conversación para evaluar comportamiento.",
  safety_flags: ["low_signal"],
};

// ---- Handler --------------------------------------------------------------

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  const ip = getClientIp(req.headers);
  const rate = await checkRateLimit(ip);
  if (!rate.ok) {
    const isMissingRedis =
      process.env.NODE_ENV === "production" &&
      !process.env.UPSTASH_REDIS_REST_URL;
    if (isMissingRedis) {
      return errorResponse(
        "INTERNAL",
        "Servicio no disponible temporalmente. Inténtalo más tarde.",
        503,
      );
    }
    return errorResponse(
      "RATE_LIMITED",
      "Demasiadas evaluaciones. Espera unos minutos y vuelve a intentar.",
      429,
    );
  }

  // Simula la latencia de una llamada real al LLM para que el frontend
  // pruebe sus estados de carga de forma realista.
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));

  // 1) Leer el form-data (imagen + campos de texto).
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse(
      "MISSING_IMAGE",
      "No recibí una imagen. Sube una captura de la reunión.",
      400,
    );
  }

  const image = form.get("image");
  const context = (form.get("context") as string | null)?.trim() ?? "";
  const intensity =
    (form.get("intensity") as RoastIntensity | null) ?? "ligero";

  // 2) Disparadores de prueba (query param o keyword en context).
  const forced =
    req.nextUrl.searchParams.get("mock") ??
    (context.includes("mock:error")
      ? "error"
      : context.includes("mock:lowsignal")
        ? "lowsignal"
        : null);

  if (forced === "error") {
    logRequest({
      durationMs: Date.now() - startedAt,
      intensity,
      confidence: "low",
      errorCode: "LLM_ERROR",
    });
    return errorResponse(
      "LLM_ERROR",
      "El analista alfa tuvo un colapso existencial. Inténtalo de nuevo.",
      500,
    );
  }

  // 3) Validaciones reales (espejo del endpoint real, PRD FR-2/3/14).
  if (!(image instanceof File)) {
    return errorResponse(
      "MISSING_IMAGE",
      "Falta la imagen. Sube una captura para evaluar.",
      400,
    );
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(image.type as AcceptedImageType)) {
    return errorResponse(
      "INVALID_TYPE",
      "Formato no soportado. Usa PNG, JPG o WEBP.",
      415,
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return errorResponse(
      "FILE_TOO_LARGE",
      "La imagen pesa demasiado (máx. 8 MB). Comprime y reintenta.",
      413,
    );
  }

  // 4) Respuesta mock. `intensity` se ignora aquí pero se acepta para que el
  //    frontend ya envíe el campo correcto contra el contrato.
  void intensity;

  if (forced === "lowsignal") {
    logRequest({ durationMs: Date.now() - startedAt, intensity, confidence: "low" });
    return NextResponse.json(MOCK_LOW_SIGNAL, { status: 200 });
  }

  logRequest({ durationMs: Date.now() - startedAt, intensity, confidence: "high" });
  return NextResponse.json(MOCK_OK, { status: 200 });
}

/** Solo metadatos no sensibles (PRD NFR-8). */
function logRequest(meta: {
  durationMs: number;
  intensity: RoastIntensity;
  confidence: "low" | "med" | "high";
  errorCode?: ApiErrorCode;
}) {
  if (process.env.NODE_ENV === "development") {
    console.info("[evaluate-alpha]", meta);
  }
}

// GET de cortesía: ayuda a verificar rápido que la ruta está viva.
export function GET() {
  return NextResponse.json({
    ok: true,
    mode: "mock",
    rateLimit: "10 requests / 5 min / IP (Upstash)",
    hint: "POST multipart/form-data { image, context?, intensity? }. Pruebas: mock:lowsignal, mock:error en context.",
  });
}
