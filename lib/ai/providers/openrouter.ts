import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createOpenRouterProvider() {
  return createOpenAiCompatibleProvider({
    id: "openrouter",
    apiKey: aiConfig.openrouter.apiKey,
    baseUrl: aiConfig.openrouter.baseUrl,
    textModels: aiConfig.openrouter.textModels,
    visionModels: aiConfig.openrouter.visionModels,
    extraHeaders: {
      "HTTP-Referer": aiConfig.openrouter.referer,
      "X-Title": aiConfig.openrouter.title,
    },
    supportsVision: true,
  });
}
