import { envFirst } from "../config";
import type { GeneratedImage } from "./types";

export async function generateHuggingFaceImage(prompt: string): Promise<GeneratedImage> {
  const token = envFirst("HUGGINFACE_TOKEN", "HF_TOKEN", "HUGGINGFACE_API_KEY");
  if (!token) {
    throw new Error("Hugging Face token is not set.");
  }

  const model = "black-forest-labs/FLUX.1-schnell";
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`huggingface ${response.status}: ${errText.slice(0, 200)}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    provider: "huggingface-flux-schnell",
    model,
  };
}
