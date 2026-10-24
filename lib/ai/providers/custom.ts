import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createCustomProvider() {
  return createOpenAiCompatibleProvider({
    id: "custom",
    apiKey: aiConfig.custom.apiKey,
    baseUrl: aiConfig.custom.baseUrl,
    textModels: aiConfig.custom.textModels,
    visionModels: aiConfig.custom.visionModels.length ? aiConfig.custom.visionModels : aiConfig.custom.textModels,
    supportsVision: aiConfig.custom.visionModels.length > 0,
  });
}
