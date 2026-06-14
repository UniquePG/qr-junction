import { NextResponse } from 'next/server';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import * as pdf from 'pdf-parse';

// ─── Helper: Fetch image from URL and convert to base64 data URL ─────────────
async function fetchImageAsBase64(url: string): Promise<{ dataUrl: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
  } catch (err) {
    console.error('Failed to fetch image for base64 conversion:', err);
    return null;
  }
}

// ─── Helper: Parse raw LLM text → JSON safely ────────────────────────────────
function parseMenuJson(raw: string): any | null {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    // Extract JSON object if surrounded by extra text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileType } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    const isPdf = fileType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf');
    let textContent = '';
    let isImage = !isPdf;

    if (isPdf) {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await (pdf as any)(buffer);
        textContent = pdfData.text;
      } catch (err: any) {
        console.error('Error parsing PDF, falling back to vision/OCR:', err);
        isImage = true;
      }
    }

    // Pre-fetch image as base64 once (reused across all NVIDIA attempts)
    let imageBase64Data: { dataUrl: string; mimeType: string } | null = null;
    if (isImage) {
      imageBase64Data = await fetchImageAsBase64(fileUrl);
      if (!imageBase64Data) {
        console.warn('Could not fetch image as base64 — will use URL-based fallbacks only.');
      }
    }

    const promptText = `
You are an expert OCR and menu parsing AI. Parse the provided menu (which is either raw text extracted from a PDF or an image).
Extract all menu categories and the items belonging to them.

Follow these strict rules:
1. Return ONLY a valid JSON object matching the schema below. Do not include markdown code fences (like \`\`\`json) or any introductory/concluding text.
2. For each item:
   - Extract 'name' (string, required).
   - Extract 'description' (string, optional, summarize if very long).
   - Detect MULTI-SIZE PRICING: If the menu lists different prices for sizes like "Quarter/Qtr", "Half", "Full", or similar column headers, extract them as 'variants':
     - 'variants': array of { "label": string, "price": number } objects (e.g. [{"label":"Half","price":120},{"label":"Full","price":200}])
     - When variants exist, set 'price' to the LOWEST variant price as the base/fallback price.
     - If only ONE price exists for an item (no size variants), set 'price' to that value and leave 'variants' as null or omit it.
   - Extract tags:
     - 'isVeg': boolean (true if veg dish, defaults to true unless specified non-veg or contains meat/fish/egg).
     - 'isNonVeg': boolean (true if contains chicken, mutton, egg, fish, beef, pork, etc.).
     - 'isVegan': boolean (true if explicitly labeled vegan).
     - 'isPopular': boolean (true if labeled chef's special, bestseller, popular, star, etc.).
3. Categorization:
   - Extract categories exactly as they appear in the menu (e.g., "Starters", "Mains", "Desserts").
   - If an item's category is not defined, not properly identified, or missing, place it in a category named "New Category" so the user can rename it later.

JSON Output Schema:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Dish Name",
          "description": "Short description of the dish",
          "price": 120.00,
          "variants": [
            { "label": "Half", "price": 120 },
            { "label": "Full", "price": 200 }
          ],
          "isVeg": true,
          "isNonVeg": false,
          "isVegan": false,
          "isPopular": false
        }
      ]
    }
  ]
}

IMPORTANT: If no size variants exist for an item, omit the 'variants' field or set it to null. Only include 'variants' when the menu clearly shows multiple size/portion prices for the same dish.
`;

    let resultJson: any = null;

    // ═══════════════════════════════════════════════════════════════════════════
    // TIER 1: NVIDIA NIM (Primary — best quality, uses base64 image)
    // Vision models: kimi-k2.6 → llama-3.2-90b-vision → llama-3.2-11b-vision → phi-3.5-vision
    // Text models: kimi-k2.6 (also handles text well)
    // ═══════════════════════════════════════════════════════════════════════════
    if (process.env.NVIDIA_API_KEY && !resultJson) {
      const nvidiaVisionModels = [
        'meta/llama-4-maverick-17b-128e-instruct',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
        'meta/llama-3.2-90b-vision-instruct',
        'moonshotai/kimi-k2.6',
        'meta/llama-3.2-11b-vision-instruct',
        'microsoft/phi-3.5-vision-instruct',
      ];
      const nvidiaTextModels = [
        'moonshotai/kimi-k2.6',
        'meta/llama-3.3-70b-instruct',
      ];

      const candidateModels = isImage ? nvidiaVisionModels : nvidiaTextModels;

      for (const model of candidateModels) {
        try {
          console.log(`[NVIDIA] Attempting menu scan with model: ${model}`);

          // Build message content
          let messageContent: any[];
          if (isImage) {
            // NVIDIA requires base64 data URL for images
            if (!imageBase64Data) {
              console.warn(`[NVIDIA] No base64 image available, skipping ${model}`);
              continue;
            }
            messageContent = [
              { type: 'text', text: promptText },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64Data.dataUrl,
                  detail: 'high', // request high-res analysis for better OCR
                },
              },
            ];
          } else {
            messageContent = [
              { type: 'text', text: promptText },
              { type: 'text', text: `PDF Text Content:\n\n${textContent}` },
            ];
          }

          const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: messageContent }],
              max_tokens: 8192,
              temperature: 0.1,
              top_p: 1.0,
              stream: false,
            }),
            signal: AbortSignal.timeout(60000),
          });

          if (response.ok) {
            const data = await response.json();
            const rawText = data.choices?.[0]?.message?.content || '{}';
            const parsed = parseMenuJson(rawText);
            console.log("parsed ", parsed)
            if (parsed && parsed.categories) {
              resultJson = parsed;
              console.log(`[NVIDIA] Successfully parsed menu using model: ${model}`);
              break;
            } else {
              console.warn(`[NVIDIA] Model ${model} returned invalid JSON structure, trying next.`);
            }
          } else {
            const errText = await response.text();
            console.warn(`[NVIDIA] Error with model ${model} (${response.status}):`, errText.slice(0, 300));
          }
        } catch (err: any) {
          console.error(`[NVIDIA] Exception with model ${model}:`, err?.message || err);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TIER 2: OpenRouter (Fallback 1 — uses external URL for images)
    // ═══════════════════════════════════════════════════════════════════════════
    if (!resultJson && process.env.OPENROUTER_API_KEY) {
      const candidateModels = isImage
        ? ['google/gemma-4-31b-it:free', 'nvidia/nemotron-nano-12b-v2-vl:free']
        : ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen3-next-80b-a3b-instruct:free'];

      const contentPayload: any[] = [{ type: 'text', text: promptText }];
      if (isImage) {
        contentPayload.push({ type: 'image_url', image_url: { url: fileUrl } });
      } else {
        contentPayload.push({ type: 'text', text: `PDF Text Content:\n\n${textContent}` });
      }

      for (const model of candidateModels) {
        try {
          console.log(`[OpenRouter] Attempting menu scan with model: ${model}`);
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              response_format: { type: 'json_object' },
              messages: [{ role: 'user', content: contentPayload }],
              temperature: 0.1,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawText = data.choices?.[0]?.message?.content || '{}';
            const parsed = parseMenuJson(rawText);
            if (parsed && parsed.categories) {
              resultJson = parsed;
              console.log(`[OpenRouter] Successfully parsed menu using model: ${model}`);
              break;
            }
          } else {
            const errText = await response.text();
            console.warn(`[OpenRouter] Error with model ${model}:`, errText.slice(0, 300));
          }
        } catch (err: any) {
          console.error(`[OpenRouter] Exception with model ${model}:`, err?.message || err);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TIER 3: Groq (Fallback 2 — vision via llama-4-scout, text via llama-3.3)
    // ═══════════════════════════════════════════════════════════════════════════
    if (!resultJson && process.env.GROQ_API_KEY) {
      const candidateGroqModels = isImage
        ? ['meta-llama/llama-4-scout-17b-16e-instruct']
        : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

      const contentPayload: any[] = [{ type: 'text', text: promptText }];
      if (isImage) {
        contentPayload.push({ type: 'image_url', image_url: { url: fileUrl } });
      } else {
        contentPayload.push({ type: 'text', text: `PDF Text Content:\n\n${textContent}` });
      }

      for (const model of candidateGroqModels) {
        try {
          console.log(`[Groq] Attempting menu scan with model: ${model}`);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              response_format: { type: 'json_object' },
              messages: [{ role: 'user', content: contentPayload }],
              temperature: 0.1,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawText = data.choices?.[0]?.message?.content || '{}';
            const parsed = parseMenuJson(rawText);
            if (parsed && parsed.categories) {
              resultJson = parsed;
              console.log(`[Groq] Successfully parsed menu using model: ${model}`);
              break;
            }
          } else {
            const errText = await response.text();
            console.warn(`[Groq] Error with model ${model}:`, errText.slice(0, 300));
          }
        } catch (err: any) {
          console.error(`[Groq] Exception with model ${model}:`, err?.message || err);
        }
      }
    }

    if (!resultJson) {
      return NextResponse.json(
        { error: 'AI Scanner could not parse the menu. All providers failed. Check server logs and API keys.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, menu: resultJson });
  } catch (error: any) {
    console.error('Menu Scan API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
