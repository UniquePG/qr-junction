import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/ai';

// Helper function to perform AI analysis on reviews
async function analyzeReview(rating: number, feedback: string, selectedTags: string, qrCodeId: number) {
  try {
    // Fetch QR Code details for business name & category context
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      select: { name: true, destination: true }
    });

    const dest = (qrCode?.destination as any) || {};
    const businessName = dest.businessName || qrCode?.name || 'our business';
    const reviewCategory = dest.reviewCategory || 'general service';

    const prompt = `Analyze this customer review:
Business: "${businessName}" (Category: "${reviewCategory}")
Rating: ${rating}/5 Stars
Selected tags: "${selectedTags || 'None'}"
Customer feedback: "${feedback || 'No comments'}"

Based on the rating and feedback, perform the following tasks:
1. Classify "sentiment" as: "Positive" (ratings 4-5), "Neutral" (rating 3), or "Negative" (ratings 1-2, or low rating with issues).
2. Classify the main "category" of the feedback (e.g. Food, Service, Cleanliness, Pricing, Product quality, Delivery, Staff behavior, Atmosphere, Other).
3. Determine "urgency" as: "High", "Medium", or "Low". Set "High" ONLY if there is an extreme complaint (e.g., food poisoning, health hazard, extreme rudeness, billing fraud, scam).
4. Generate a polite, personalized "aiReply" from the business owner.
   - For positive reviews, thank them warmly and invite them back.
   - For negative/neutral reviews, apologize sincerely for the specific issue mentioned, explain that management is addressing it, and invite them to contact support.
5. Provide 1-2 bullet points of "recommendations" for business improvement.

Format your response strictly as a JSON object matching this schema:
{
  "sentiment": "Positive | Neutral | Negative",
  "category": "string",
  "urgency": "Low | Medium | High",
  "aiReply": "string",
  "recommendations": ["string"]
}
Return only valid JSON. Do not include markdown backticks or other conversational text.`;

    console.log('[AI Analysis] Requesting analysis for rating:', rating);
    const aiText = await callLLM(prompt, true);
    let cleanJson = aiText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);
    return {
      sentiment: parsed.sentiment || (rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative'),
      category: parsed.category || 'General',
      urgency: parsed.urgency || (rating <= 2 ? 'Medium' : 'Low'),
      aiReply: parsed.aiReply || `Thank you for your rating of ${rating} stars. We appreciate your feedback.`,
      aiAnalysis: { recommendations: parsed.recommendations || [] }
    };
  } catch (error) {
    console.error('[AI Analysis] Error analyzing review:', error);
    // Safe fallbacks
    return {
      sentiment: rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative',
      category: rating >= 4 ? 'General' : 'Service',
      urgency: rating <= 2 ? 'Medium' : 'Low',
      aiReply: rating >= 4 
        ? "Thank you so much for your review! We look forward to serving you again." 
        : "We apologize for the experience not meeting your expectations. We are working to improve.",
      aiAnalysis: { recommendations: ["Gather more feedback to analyze suggestions."] }
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, qrCodeId, rating, feedback, name, phone, selectedTags } = body;

    // Convert selectedTags to comma-separated string if it comes as array
    let tagsStr = '';
    if (selectedTags) {
      tagsStr = Array.isArray(selectedTags) ? selectedTags.join(', ') : String(selectedTags);
    }

    // AI Analysis trigger condition: if there is feedback text or positive/negative tags
    let aiFields: any = {};
    if (rating && (feedback || tagsStr)) {
      let resolvedQrCodeId = Number(qrCodeId || 0);
      if (!resolvedQrCodeId && id) {
        const existingReview = await prisma.reviewResponse.findUnique({
          where: { id: Number(id) }
        });
        if (existingReview) {
          resolvedQrCodeId = existingReview.qrCodeId;
        }
      }
      aiFields = await analyzeReview(rating, feedback, tagsStr, resolvedQrCodeId);
    }

    if (id) {
      // Update existing review
      const existingReview = await prisma.reviewResponse.findUnique({
        where: { id: Number(id) }
      });

      if (!existingReview) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      // If we didn't get qrCodeId in body, fetch from existing
      const resolvedQrCodeId = qrCodeId || existingReview.qrCodeId;
      if (feedback || tagsStr) {
        aiFields = await analyzeReview(rating || existingReview.rating, feedback || existingReview.feedback || '', tagsStr || existingReview.selectedTags || '', resolvedQrCodeId);
      }

      const reviewResponse = await prisma.reviewResponse.update({
        where: { id: Number(id) },
        data: {
          rating: rating !== undefined ? rating : undefined,
          feedback: feedback !== undefined ? feedback : undefined,
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
          selectedTags: tagsStr || undefined,
          sentiment: aiFields.sentiment || undefined,
          category: aiFields.category || undefined,
          urgency: aiFields.urgency || undefined,
          aiReply: aiFields.aiReply || undefined,
          aiAnalysis: aiFields.aiAnalysis || undefined,
        },
      });

      return NextResponse.json({ success: true, reviewResponse });
    }

    if (!qrCodeId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Bad Request: qrCodeId and valid rating are required.' },
        { status: 400 }
      );
    }

    // Save the review
    const reviewResponse = await prisma.reviewResponse.create({
      data: {
        qrCodeId: Number(qrCodeId),
        rating,
        feedback: feedback || '',
        name: name || '',
        phone: phone || '',
        selectedTags: tagsStr || '',
        sentiment: aiFields.sentiment || (rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative'),
        category: aiFields.category || 'General',
        urgency: aiFields.urgency || (rating <= 2 ? 'Medium' : 'Low'),
        aiReply: aiFields.aiReply || '',
        aiAnalysis: aiFields.aiAnalysis || {},
      },
    });

    return NextResponse.json({ success: true, reviewResponse });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
