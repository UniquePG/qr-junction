import type { ProviderId } from "../config";
import type { LlmProvider } from "../types";
import { createAgentRouterProvider } from "./agentRouter";
import { createCursorProvider } from "./cursor";
import { createCustomProvider } from "./custom";
import { createGroqProvider } from "./groq";
import { createNvidiaProvider } from "./nvidia";
import { createOpenAiProvider } from "./openai";
import { createOpenRouterProvider } from "./openrouter";
import { createSarvamProvider } from "./sarvam";

const factories: Record<ProviderId, () => LlmProvider> = {
  openai: createOpenAiProvider,
  sarvam: createSarvamProvider,
  agentrouter: createAgentRouterProvider,
  groq: createGroqProvider,
  openrouter: createOpenRouterProvider,
  nvidia: createNvidiaProvider,
  cursor: createCursorProvider,
  custom: createCustomProvider,
};

export function createProvider(id: ProviderId): LlmProvider {
  return factories[id]();
}

export function createAllProviders(): LlmProvider[] {
  return Object.values(factories).map((factory) => factory());
}
