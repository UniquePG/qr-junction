import { aiConfig, openaiHeaders } from "../config";
import type { GeneratedImage } from "./types";

export async function generateOpenAiImage(prompt: string): Promise<GeneratedImage> {
  const { apiKey, baseUrl, imageModel, imageQuality, imageSize } = aiConfig.openai;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...openaiHeaders(),
    },
    body: JSON.stringify({
      model: imageModel,
      prompt,
      n: 1,
      size: imageSize,
      quality: imageQuality,
      output_format: "png",
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`openai/${imageModel} ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const item = data.data?.[0];
  const b64 = item?.b64_json;
  if (b64) {
    return { buffer: Buffer.from(b64, "base64"), provider: "openai", model: imageModel };
  }

  if (item?.url) {
    const imageRes = await fetch(item.url, { signal: AbortSignal.timeout(20000) });
    if (!imageRes.ok) {
      throw new Error(`openai/${imageModel} could not download the generated image.`);
    }
    return {
      buffer: Buffer.from(await imageRes.arrayBuffer()),
      provider: "openai",
      model: imageModel,
    };
  }

  throw new Error(`openai/${imageModel} returned no image data.`);
}
