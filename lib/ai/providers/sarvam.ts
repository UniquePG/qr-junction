import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";
import type { ChatContentPart, ChatRequest, LlmProvider } from "../types";

function isInlineImageUrl(url: string): boolean {
  return url.startsWith("data:image/");
}

function assertInlineImages(request: ChatRequest) {
  for (const message of request.messages) {
    if (!Array.isArray(message.content)) continue;
    for (const part of message.content as ChatContentPart[]) {
      if (part.type !== "image_url") continue;
      if (!isInlineImageUrl(part.image_url.url)) {
        throw new Error("Sarvam vision requires an inline base64 image. Remote image URLs are rejected.");
      }
    }
  }
}

export function createSarvamProvider(): LlmProvider {
  const inner = createOpenAiCompatibleProvider({
    id: "sarvam",
    apiKey: aiConfig.sarvam.apiKey,
    baseUrl: aiConfig.sarvam.baseUrl,
    textModels: aiConfig.sarvam.textModels,
    visionModels: aiConfig.sarvam.visionModels,
    extraHeaders: {
      "api-subscription-key": aiConfig.sarvam.apiKey,
    },
    supportsVision: aiConfig.sarvam.visionModels.length > 0,
  });

  return {
    ...inner,
    async complete(request: ChatRequest) {
      if ((request.capability || "text") === "vision") {
        assertInlineImages(request);
      }
      return inner.complete(request);
    },
  };
}
