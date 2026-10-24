import type { GeneratedImage } from "./types";

async function fetchPollinations(prompt: string, model: string): Promise<GeneratedImage> {
  const response = await fetch(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&private=true&enhance=false&model=${model}`,
    { method: "GET", signal: AbortSignal.timeout(20000) },
  );

  if (!response.ok) {
    throw new Error(`pollinations/${model} ${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    provider: `pollinations-${model}`,
    model,
  };
}

export async function generatePollinationsImage(prompt: string): Promise<GeneratedImage> {
  try {
    return await fetchPollinations(prompt, "flux-realism");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[Image] Pollinations flux-realism failed:", message.slice(0, 200));
    return fetchPollinations(prompt, "flux");
  }
}
