// AI integration helper for QR Junction
// Utilizes Groq (Primary) and OpenRouter (Fallback)

export async function callLLM(prompt: string, jsonMode = false): Promise<string> {
  const systemPrompt = "You are a highly experienced SaaS developer, business consultant, and assistant for QR Junction, a QR code marketing platform. Answer strictly in JSON format if requested, and follow all constraints.";

  // 1. Try Groq (Llama-3.3-70b-versatile or Llama-3.1-8b-instant)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('[AI Helper] Attempting Groq call...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) {
          console.log('[AI Helper] Groq call succeeded.');
          return text;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Helper] Groq error status ${response.status}:`, errText.slice(0, 300));
      }
    } catch (error: any) {
      console.error('[AI Helper] Groq exception:', error?.message || error);
    }
  }

  // 2. Try OpenRouter (Llama 3.3 70B Instruct or Gemma 2 9B)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('[AI Helper] Attempting OpenRouter call...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://qrjunction.in', // Required by OpenRouter
          'X-Title': 'QR Junction',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) {
          console.log('[AI Helper] OpenRouter call succeeded.');
          return text;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Helper] OpenRouter error status ${response.status}:`, errText.slice(0, 300));
      }
    } catch (error: any) {
      console.error('[AI Helper] OpenRouter exception:', error?.message || error);
    }
  }

  // If both failed or are missing key configurations
  throw new Error('AI Service is currently unavailable. Please verify API keys.');
}
