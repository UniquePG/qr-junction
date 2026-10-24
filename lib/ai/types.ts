export type ChatRole = "system" | "user" | "assistant";

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" } };

export type ChatMessage = {
  role: ChatRole;
  content: string | ChatContentPart[];
};

export type ChatCapability = "text" | "vision";

export type ChatRequest = {
  messages: ChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  capability?: ChatCapability;
  model?: string;
  /** Restrict or reorder providers for this call. Reviews omit this and use AI_PROVIDERS. */
  providers?: string[];
};

export type ChatResult = {
  text: string;
  provider: string;
  model: string;
};

export interface LlmProvider {
  id: string;
  isConfigured(): boolean;
  supports(capability: ChatCapability): boolean;
  complete(request: ChatRequest): Promise<ChatResult>;
}
