import { envFirst } from "@/lib/ai/config";
import {
  MENU_TO_SARVAM,
  type MenuLocaleCode,
  type SarvamLangCode,
} from "./locales";

const TRANSLATE_URL = "https://api.sarvam.ai/translate";
const MAX_CHARS = 900;
const MAX_RETRIES = 3;

type TranslateResponse = {
  translated_text?: string;
  request_id?: string;
};

function getApiKey(): string {
  return envFirst("SARVAM_API_KEY");
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateChunk(
  input: string,
  source: SarvamLangCode,
  target: SarvamLangCode,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured");
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(TRANSLATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify({
          input,
          source_language_code: source,
          target_language_code: target,
          model: "mayura:v1",
          mode: "formal",
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Sarvam translate failed (${res.status}): ${body.slice(0, 200)}`);
      }

      const data = (await res.json()) as TranslateResponse;
      if (typeof data.translated_text !== "string") {
        throw new Error("Sarvam translate returned no translated_text");
      }
      return data.translated_text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(400 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Sarvam translate failed");
}

function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= MAX_CHARS) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;
  while (remaining.length > MAX_CHARS) {
    let cut = remaining.lastIndexOf(" ", MAX_CHARS);
    if (cut < MAX_CHARS / 2) cut = MAX_CHARS;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks.filter(Boolean);
}

/** Translate English text into a menu locale via Sarvam Mayura. */
export async function translateText(
  text: string,
  targetLocale: MenuLocaleCode,
  sourceLocale: MenuLocaleCode = "en",
): Promise<string> {
  const input = text.trim();
  if (!input) return "";
  if (targetLocale === sourceLocale) return input;

  const source = MENU_TO_SARVAM[sourceLocale];
  const target = MENU_TO_SARVAM[targetLocale];
  const parts = chunkText(input);
  const translated: string[] = [];
  for (const part of parts) {
    translated.push(await translateChunk(part, source, target));
  }
  return translated.join(" ").trim();
}

/** Translate many short strings sequentially (stable for rate limits). */
export async function translateMany(
  texts: string[],
  targetLocale: MenuLocaleCode,
  sourceLocale: MenuLocaleCode = "en",
): Promise<string[]> {
  const out: string[] = [];
  for (const text of texts) {
    if (!text.trim()) {
      out.push("");
      continue;
    }
    out.push(await translateText(text, targetLocale, sourceLocale));
  }
  return out;
}
