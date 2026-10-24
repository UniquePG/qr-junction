import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createGroqProvider() {
  return createOpenAiCompatibleProvider({
    id: "groq",
    apiKey: aiConfig.groq.apiKey,
    baseUrl: aiConfig.groq.baseUrl,
    textModels: aiConfig.groq.textModels,
    visionModels: aiConfig.groq.visionModels,
    supportsVision: aiConfig.groq.visionModels.length > 0,
  });
}
