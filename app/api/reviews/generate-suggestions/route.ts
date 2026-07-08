import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, selectedTags, businessName, reviewCategory, language } = body;

    if (!rating || !businessName || !reviewCategory) {
      return NextResponse.json(
        { error: 'Missing required fields: rating, businessName, reviewCategory' },
        { status: 400 }
      );
    }

    const tagsStr = (selectedTags && Array.isArray(selectedTags) && selectedTags.length > 0)
      ? selectedTags.join(', ')
      : 'overall experience';

    const selectedLanguage = language === 'Hindi' ? 'Hindi (written in Devanagari script)' : 'English';

    const prompt = `You are a helpful customer review helper. Generate exactly 3 short, realistic, and positive review suggestions for a business named "${businessName}" in the category "${reviewCategory}".
The customer gave a rating of ${rating} stars out of 5 and highlighted: ${tagsStr}.

Please generate these 3 review options in ${selectedLanguage}.
Make sure the reviews are:
1. Short (around 8 to 15 words each).
2. Written in first person ("I loved...", "The food was...", "यहाँ की...", "मुझे...").
3. Diverse in tone and focus.
4. Natural, sounding like a human customer, with no hashtags, emoji, quotes, or conversational prefix.

Output your response strictly as a JSON object with a single key 'suggestions' which contains an array of exactly 3 strings. Example format:
{
  "suggestions": [
    "First review suggestion here",
    "Second review suggestion here",
    "Third review suggestion here"
  ]
}
Do not return any introductory, explanation, or markdown backticks outside of valid JSON.`;

    const aiResponseText = await callLLM(prompt, true);
    console.log('[AI Suggestions] Raw AI response:', aiResponseText);

    // Clean JSON string if markdown wraps it
    let cleanJson = aiResponseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const result = JSON.parse(cleanJson);

    if (!result.suggestions || !Array.isArray(result.suggestions) || result.suggestions.length < 3) {
      throw new Error('AI did not return expected suggestions array format');
    }

    return NextResponse.json({ success: true, suggestions: result.suggestions });
  } catch (error: any) {
    console.error('Error generating review suggestions:', error);
    // Fallback static reviews if LLM fails or returns garbage
    const rating = 5;
    const isHindi = false; // check from request if possible, but fallback is simple
    const fallbackReviews = [
      "Excellent service and friendly environment. Will definitely visit again!",
      "Great experience overall, highly recommend to everyone.",
      "Amazing quality and very friendly staff. Five stars!"
    ];

    return NextResponse.json({
      success: false,
      error: error.message,
      suggestions: fallbackReviews
    });
  }
}
