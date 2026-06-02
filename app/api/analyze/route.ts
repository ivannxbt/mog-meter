import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOG_SYSTEM_PROMPT } from "@/lib/mog-prompt";
import { resizeImageToBase64 } from "@/lib/prepare-image";
import {
  MOG_INTENSITIES,
  type MogIntensity,
  type MogResult,
} from "@/lib/mog-types";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 8 * 1024 * 1024;

// The model sometimes wraps the JSON in markdown fences or — when it "thinks
// out loud" — emits a sentence or two of prose before the actual object. A
// naive JSON.parse on that whole blob throws. So we first strip code fences,
// then, if parsing still fails, fall back to extracting the substring between
// the first "{" and the last "}" (the JSON object itself) and parse that.
function parseLlmJson(text: string): MogResult {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as MogResult;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in model response");
    }
    return JSON.parse(cleaned.slice(start, end + 1)) as MogResult;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const intensityRaw = formData.get("intensity");

  if (!image || !(image instanceof Blob) || image.size === 0) {
    return Response.json({ error: "Falta la imagen." }, { status: 400 });
  }

  const mimeType = image.type;
  if (!ACCEPTED_TYPES.has(mimeType)) {
    return Response.json({ error: "INVALID_TYPE" }, { status: 400 });
  }

  if (image.size > MAX_BYTES) {
    return Response.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const intensity =
    typeof intensityRaw === "string" &&
    MOG_INTENSITIES.includes(intensityRaw as MogIntensity)
      ? (intensityRaw as MogIntensity)
      : "roast";

  let base64Image: string;
  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const prepared = await resizeImageToBase64(buffer);
    base64Image = prepared.base64;
  } catch (err) {
    // sharp failed to decode/resize: bad/corrupt input, not a backend fault.
    console.error("[analyze] image preparation failed:", err);
    return Response.json({ error: "INVALID_IMAGE" }, { status: 400 });
  }

  let text: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Force the model to emit a raw JSON object instead of free-form text.
      // Without this, the thinking model can prepend its reasoning as prose,
      // which then breaks JSON parsing downstream.
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent([
      { text: MOG_SYSTEM_PROMPT },
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      {
        text: `Analiza este screenshot. Intensity: ${intensity}. Identifica cada participante con las reglas de UI (WhatsApp: nombre sobre el bloque y/o etiqueta inferior derecha de la burbuja) y devuelve únicamente el JSON.`,
      },
    ]);

    const response = result.response;
    text = response.text();

    if (!text) {
      // Empty text usually means the response was blocked by a safety filter
      // or returned no candidate. Log the reason so it's visible in Vercel.
      console.error(
        "[analyze] empty model response.",
        "promptFeedback:",
        JSON.stringify(response.promptFeedback),
        "finishReason:",
        response.candidates?.[0]?.finishReason,
      );
      return Response.json({ error: "LLM_ERROR" }, { status: 500 });
    }
  } catch (err) {
    // Network error, invalid API key, quota, or a safety block that throws
    // when .text() is called on a blocked response.
    console.error("[analyze] Gemini request failed:", err);
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }

  try {
    const parsed = parseLlmJson(text);
    return Response.json(parsed, { status: 200 });
  } catch (err) {
    // Model returned text we couldn't coerce into the expected JSON shape.
    console.error("[analyze] failed to parse model JSON:", err, "raw:", text);
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }
}
