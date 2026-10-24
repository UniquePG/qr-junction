import { uniqueModels } from "./config";
import type { ChatCapability, ChatRequest, ChatResult, LlmProvider } from "./types";

type OpenAiCompatibleOptions = {
  id: string;
  apiKey: string;
  baseUrl: string;
  textModels: string[];
  visionModels: string[];
  extraHeaders?: Record<string, string>;
  supportsVision?: boolean;
  supportsJsonMode?: boolean;
};

function extractMessageText(data: any): string {
  const message = data?.choices?.[0]?.message;
  if (!message) return "";

  const content = message.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => (typeof part === "string" ? part : part?.text || part?.content || ""))
      .join("")
      .trim();
    if (joined) return joined;
  }

  return "";
}

async function completeOnce(
  options: OpenAiCompatibleOptions,
  request: ChatRequest,
  model: string,
): Promise<ChatResult> {
  const timeoutMs = request.timeoutMs ?? 20000;
  const useJsonMode = Boolean(request.jsonMode) && options.supportsJsonMode !== false;

  const response = await fetch(`${options.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
      ...(options.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 1024,
      stream: false,
      ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${options.id}/${model} ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = extractMessageText(data);
  if (!text.trim()) {
    throw new Error(`${options.id}/${model} returned an empty response.`);
  }

  return { text, provider: options.id, model };
}

export function createOpenAiCompatibleProvider(options: OpenAiCompatibleOptions): LlmProvider {
  return {
    id: options.id,
    isConfigured: () => Boolean(options.apiKey && options.baseUrl && options.textModels.length),
    supports: (capability: ChatCapability) => capability === "text" || options.supportsVision !== false,
    async complete(request: ChatRequest): Promise<ChatResult> {
      const capability = request.capability || "text";
      const fallbacks = capability === "vision" ? options.visionModels : options.textModels;
      const models = uniqueModels(request.model, fallbacks);

      if (!models.length) {
        throw new Error(`${options.id} has no ${capability} models configured.`);
      }

      const errors: string[] = [];
      for (const model of models) {
        try {
          return await completeOnce(options, request, model);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`[AI] ${options.id} model ${model} failed:`, message.slice(0, 300));
          errors.push(message);
        }
      }

      throw new Error(`${options.id} exhausted models. ${errors.join(" | ")}`);
    },
  };
}
