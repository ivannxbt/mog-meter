import sharp from "sharp";

export async function resizeImageToBase64(
  buffer: Buffer,
): Promise<{ base64: string; mimeType: "image/jpeg" }> {
  const output = await sharp(buffer)
    .rotate()
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return {
    base64: output.toString("base64"),
    mimeType: "image/jpeg",
  };
}
