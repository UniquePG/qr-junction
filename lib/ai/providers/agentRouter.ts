import { aiConfig } from "../config";
import { createOpenAiCompatibleProvider } from "../openaiCompatible";

export function createAgentRouterProvider() {
  return createOpenAiCompatibleProvider({
    id: "agentrouter",
    apiKey: aiConfig.agentRouter.apiKey,
    baseUrl: aiConfig.agentRouter.baseUrl,
    textModels: aiConfig.agentRouter.textModels,
    visionModels: aiConfig.agentRouter.visionModels,
    supportsVision: true,
  });
}
