import { aiConfig, openaiHeaders } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createOpenAiProvider() {
  return createOpenAiCompatibleProvider({
    id: "openai",
    apiKey: aiConfig.openai.apiKey,
    baseUrl: aiConfig.openai.baseUrl,
    textModels: aiConfig.openai.textModels,
    visionModels: aiConfig.openai.visionModels,
    extraHeaders: openaiHeaders(),
    supportsVision: true,
  });
}
