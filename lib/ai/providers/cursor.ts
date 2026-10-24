import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createCursorProvider() {
  return createOpenAiCompatibleProvider({
    id: "cursor",
    apiKey: aiConfig.cursor.apiKey,
    baseUrl: aiConfig.cursor.baseUrl,
    textModels: aiConfig.cursor.textModels,
    visionModels: aiConfig.cursor.visionModels,
    supportsVision: true,
  });
}
