// Reviews use AI_PROVIDERS. Menu scan / dish images pick providers in those routes.
export type ProviderId =
  | "openai"
  | "sarvam"
  | "agentrouter"
  | "groq"
  | "openrouter"
  | "nvidia"
  | "cursor"
  | "custom";

const KNOWN_PROVIDERS: ProviderId[] = [
  "openai",
  "sarvam",
  "agentrouter",
  "groq",
  "openrouter",
  "nvidia",
  "cursor",
  "custom",
];

const DEFAULT_ORDER: ProviderId[] = ["sarvam", "agentrouter", "groq", "openrouter", "nvidia"];

export function envFirst(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function envList(...keys: string[]): string[] {
  const raw = envFirst(...keys);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueModels(...groups: Array<string | string[] | undefined>): string[] {
  const seen = new Set<string>();
  const models: string[] = [];
  for (const group of groups) {
    const values = Array.isArray(group) ? group : group ? [group] : [];
    for (const value of values) {
      const model = value.trim();
      if (!model || seen.has(model)) continue;
      seen.add(model);
      models.push(model);
    }
  }
  return models;
}

export function parseProviderIds(values?: string[]): ProviderId[] {
  if (!values?.length) return [];
  return values
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is ProviderId => KNOWN_PROVIDERS.includes(item as ProviderId));
}

export function getProviderOrder(override?: string[]): ProviderId[] {
  const fromOverride = parseProviderIds(override);
  if (fromOverride.length) return fromOverride;

  const parsed = parseProviderIds(envList("AI_PROVIDERS"));
  return parsed.length ? parsed : DEFAULT_ORDER;
}

export function openaiHeaders(): Record<string, string> {
  const org = envFirst("OPENAI_ORG_ID", "OPENAI_ORGANIZATION");
  return org ? { "OpenAI-Organization": org } : {};
}

export const aiConfig = {
  textModel: envFirst("AI_TEXT_MODEL") || "gpt-4o-mini",
  visionModel: envFirst("AI_VISION_MODEL") || "gpt-4o-mini",
  defaultSystemPrompt:
    "You are a highly experienced SaaS developer, business consultant, and assistant for QR Junction, a QR code marketing platform. Answer strictly in JSON format if requested, and follow all constraints.",
  openai: {
    apiKey: envFirst("OPENAI_API_KEY"),
    baseUrl: (envFirst("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(/\/$/, ""),
    textModels: uniqueModels(
      envFirst("OPENAI_TEXT_MODEL") || "gpt-4o-mini",
      envList("OPENAI_TEXT_MODELS"),
      ["gpt-4.1-nano"],
    ),
    visionModels: uniqueModels(
      envFirst("OPENAI_VISION_MODEL") || "gpt-4o-mini",
      envList("OPENAI_VISION_MODELS"),
      ["gpt-4.1-nano"],
    ),
    imageModel: envFirst("OPENAI_IMAGE_MODEL") || "gpt-image-2.5-flare",
    imageQuality: envFirst("OPENAI_IMAGE_QUALITY") || "low",
    imageSize: envFirst("OPENAI_IMAGE_SIZE") || "1024x1024",
  },
  sarvam: {
    apiKey: envFirst("SARVAM_API_KEY"),
    baseUrl: (envFirst("SARVAM_BASE_URL") || "https://api.sarvam.ai/v2").replace(/\/$/, ""),
    textModels: uniqueModels(
      envFirst("SARVAM_TEXT_MODEL") || "sarvam-105b",
      envList("SARVAM_TEXT_MODELS"),
      ["gemma4"],
    ),
    visionModels: uniqueModels(envFirst("SARVAM_VISION_MODEL") || "gemma4", envList("SARVAM_VISION_MODELS")),
  },
  agentRouter: {
    apiKey: envFirst("AGENT_ROUTER_API_KEY", "AGENTROUTER_API_KEY"),
    baseUrl: (envFirst("AGENT_ROUTER_BASE_URL", "AGENTROUTER_BASE_URL") || "https://agentrouter.org/v1").replace(/\/$/, ""),
    textModels: uniqueModels(
      envFirst("AGENT_ROUTER_TEXT_MODEL") || envFirst("AI_TEXT_MODEL") || "gpt-4o-mini",
      envList("AGENT_ROUTER_TEXT_MODELS"),
      ["gpt-4o", "deepseek-chat"],
    ),
    visionModels: uniqueModels(
      envFirst("AGENT_ROUTER_VISION_MODEL") || envFirst("AI_VISION_MODEL") || "gpt-4o-mini",
      envList("AGENT_ROUTER_VISION_MODELS"),
      ["gpt-4o"],
    ),
  },
  groq: {
    apiKey: envFirst("GROQ_API_KEY"),
    baseUrl: "https://api.groq.com/openai/v1",
    textModels: uniqueModels(
      envFirst("GROQ_TEXT_MODEL") || "qwen/qwen3.8-27b",
      envList("GROQ_TEXT_MODELS"),
      ["openai/gpt-oss-20b", "openai/gpt-oss-120b"],
    ),
    visionModels: uniqueModels(envFirst("GROQ_VISION_MODEL"), envList("GROQ_VISION_MODELS")),
  },
  openrouter: {
    apiKey: envFirst("OPENROUTER_API_KEY"),
    baseUrl: "https://openrouter.ai/api/v1",
    textModels: uniqueModels(
      envFirst("OPENROUTER_TEXT_MODEL") || "meta-llama/llama-3.3-70b-instruct:free",
      envList("OPENROUTER_TEXT_MODELS"),
      ["meta-llama/llama-3-8b-instruct:free"],
    ),
    visionModels: uniqueModels(
      envFirst("OPENROUTER_VISION_MODEL") || "meta-llama/llama-3.2-11b-vision-instruct:free",
      envList("OPENROUTER_VISION_MODELS"),
      ["google/gemma-2-9b-it:free"],
    ),
    referer: envFirst("NEXT_PUBLIC_CLIENT_URL") || "https://qrjunction.in",
    title: "QR Junction",
  },
  nvidia: {
    apiKey: envFirst("NVIDIA_API_KEY"),
    baseUrl: "https://integrate.api.nvidia.com/v1",
    textModels: uniqueModels(
      envFirst("NVIDIA_TEXT_MODEL") || "meta/llama-3.3-70b-instruct",
      envList("NVIDIA_TEXT_MODELS"),
      ["moonshotai/kimi-k2.6"],
    ),
    visionModels: uniqueModels(
      envFirst("NVIDIA_VISION_MODEL") || "meta/llama-3.2-90b-vision-instruct",
      envList("NVIDIA_VISION_MODELS"),
      ["meta/llama-3.2-11b-vision-instruct", "microsoft/phi-3.5-vision-instruct"],
    ),
  },
  cursor: {
    apiKey: envFirst("CURSOR_API_KEY"),
    baseUrl: (envFirst("CURSOR_BASE_URL") || "").replace(/\/$/, ""),
    textModels: uniqueModels(
      envFirst("CURSOR_TEXT_MODEL") || envFirst("AI_TEXT_MODEL") || "gpt-4o-mini",
      envList("CURSOR_TEXT_MODELS"),
    ),
    visionModels: uniqueModels(
      envFirst("CURSOR_VISION_MODEL") || envFirst("AI_VISION_MODEL") || "gpt-4o-mini",
      envList("CURSOR_VISION_MODELS"),
    ),
  },
  custom: {
    apiKey: envFirst("CUSTOM_LLM_API_KEY"),
    baseUrl: (envFirst("CUSTOM_LLM_BASE_URL") || "").replace(/\/$/, ""),
    textModels: uniqueModels(envFirst("CUSTOM_LLM_TEXT_MODEL"), envList("CUSTOM_LLM_TEXT_MODELS")),
    visionModels: uniqueModels(envFirst("CUSTOM_LLM_VISION_MODEL"), envList("CUSTOM_LLM_VISION_MODELS")),
  },
};
