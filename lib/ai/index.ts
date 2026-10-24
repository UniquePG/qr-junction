import { aiConfig } from "./config";
import { completeChat } from "./router";

export { completeChat } from "./router";
export { getConfiguredProviders } from "./router";
export { generateDishImage } from "./images";
export { aiConfig } from "./config";
export type { ChatCapability, ChatMessage, ChatRequest, ChatResult, LlmProvider } from "./types";
export type { GeneratedImage } from "./images";

export async function callLLM(prompt: string, jsonMode = false): Promise<string> {
  const result = await completeChat({
    messages: [
      { role: "system", content: aiConfig.defaultSystemPrompt },
      { role: "user", content: prompt },
    ],
    jsonMode,
    temperature: 0.3,
    maxTokens: 1024,
    timeoutMs: 15000,
    capability: "text",
  });

  return result.text;
}
