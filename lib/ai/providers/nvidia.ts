import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createNvidiaProvider() {
  return createOpenAiCompatibleProvider({
    id: "nvidia",
    apiKey: aiConfig.nvidia.apiKey,
    baseUrl: aiConfig.nvidia.baseUrl,
    textModels: aiConfig.nvidia.textModels,
    visionModels: aiConfig.nvidia.visionModels,
    extraHeaders: { Accept: "application/json" },
    supportsVision: true,
    supportsJsonMode: false,
  });
}
