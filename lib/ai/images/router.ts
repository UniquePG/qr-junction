import { aiConfig } from "../config";
import { generateHuggingFaceImage } from "./huggingface";
import { generateOpenAiImage } from "./openai";
import { generatePollinationsImage } from "./pollinations";
import type { GeneratedImage } from "./types";

type ImageGenerator = {
  id: string;
  isConfigured: () => boolean;
  generate: (prompt: string) => Promise<GeneratedImage>;
};

function imageProviders(): ImageGenerator[] {
  return [
    {
      id: "openai",
      isConfigured: () => Boolean(aiConfig.openai.apiKey),
      generate: generateOpenAiImage,
    },
    {
      id: "pollinations",
      isConfigured: () => true,
      generate: generatePollinationsImage,
    },
    {
      id: "huggingface",
      isConfigured: () => true,
      generate: generateHuggingFaceImage,
    },
  ];
}

export async function generateDishImage(prompt: string): Promise<GeneratedImage> {
  const errors: string[] = [];

  for (const provider of imageProviders()) {
    if (!provider.isConfigured()) continue;
    try {
      console.log(`[Image] Trying ${provider.id}...`);
      const result = await provider.generate(prompt);
      console.log(`[Image] ${provider.id} succeeded with ${result.model}.`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Image] ${provider.id} failed:`, message.slice(0, 300));
      errors.push(`${provider.id}: ${message}`);
    }
  }

  throw new Error(`All image providers failed. ${errors.join(" | ")}`);
}
