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

function parseLlmJson(text: string): MogResult {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as MogResult;
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
  } catch {
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }

  let text: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      { text: MOG_SYSTEM_PROMPT },
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      {
        text: `Analiza este screenshot. Intensity: ${intensity}. Devuelve el JSON.`,
      },
    ]);
    text = result.response.text();
    if (!text) {
      return Response.json({ error: "LLM_ERROR" }, { status: 500 });
    }
  } catch {
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }

  try {
    const parsed = parseLlmJson(text);
    return Response.json(parsed, { status: 200 });
  } catch {
    return Response.json({ error: "LLM_ERROR" }, { status: 500 });
  }
}
