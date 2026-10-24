import { getProviderOrder } from "./config";
import { createAllProviders } from "./providers";
import type { ChatRequest, ChatResult, LlmProvider } from "./types";

export function getConfiguredProviders(
  capability: ChatRequest["capability"] = "text",
  orderOverride?: string[],
): LlmProvider[] {
  const order = getProviderOrder(orderOverride);
  const registry = new Map(createAllProviders().map((provider) => [provider.id, provider]));

  return order
    .map((id) => registry.get(id))
    .filter((provider): provider is LlmProvider => Boolean(provider))
    .filter((provider) => provider.isConfigured() && provider.supports(capability || "text"));
}

export async function completeChat(request: ChatRequest): Promise<ChatResult> {
  const capability = request.capability || "text";
  const providers = getConfiguredProviders(capability, request.providers);

  if (!providers.length) {
    throw new Error("No AI providers are configured. Set OPENAI_API_KEY or another provider key.");
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      console.log(`[AI] Trying ${provider.id} (${capability})...`);
      const result = await provider.complete(request);
      console.log(`[AI] ${provider.id} succeeded with ${result.model}.`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[AI] ${provider.id} failed:`, message.slice(0, 300));
      errors.push(`${provider.id}: ${message}`);
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
}
