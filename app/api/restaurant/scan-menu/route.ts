import { NextResponse } from 'next/server';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { completeChat } from '@/lib/ai';

export const maxDuration = 60; // Max allowed duration on Vercel Hobby plan is 60 seconds

// Polyfills for PDF parsing on server-side environments (Node.js/Vercel)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: string | number[]) {
      if (Array.isArray(init)) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }
  } as any;
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    width: number; height: number; data: Uint8ClampedArray;
    constructor(width: number, height: number) {
      this.width = width; this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  } as any;
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D { addPath() {} } as any;
}

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
        const pdfModule = await import('pdf-parse') as any;
        const pdfParser = pdfModule.default || pdfModule;
        const pdfData = await (pdfParser as any)(buffer);
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

    const imageUrl = imageBase64Data?.dataUrl || fileUrl;
    const userContent = isImage
      ? [
          { type: 'text' as const, text: promptText },
          { type: 'image_url' as const, image_url: { url: imageUrl, detail: 'high' as const } },
        ]
      : [
          { type: 'text' as const, text: promptText },
          { type: 'text' as const, text: `PDF Text Content:\n\n${textContent}` },
        ];

    try {
      const ai = await completeChat({
        messages: [{ role: 'user', content: userContent }],
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 8192,
        timeoutMs: 25000,
        capability: isImage ? 'vision' : 'text',
        providers: ['openai', 'sarvam', 'openrouter', 'nvidia', 'groq'],
      });
      const parsed = parseMenuJson(ai.text);
      if (parsed?.categories) {
        resultJson = parsed;
        console.log(`[Menu Scan] Parsed menu with ${ai.provider}/${ai.model}`);
      }
    } catch (err: any) {
      console.error('[Menu Scan] All AI providers failed:', err?.message || err);
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
