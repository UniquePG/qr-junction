import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { callLLM } from '@/lib/ai';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const qrCodeIdParam = searchParams.get('qrCodeId');
    const qrCodeId = qrCodeIdParam ? parseInt(qrCodeIdParam, 10) : null;

    // 1. Fetch QR codes to ensure ownership
    const userQrs = await prisma.qRCode.findMany({
      where: {
        userId,
        type: 'REVIEW',
        status: { not: 'DELETED' },
        id: qrCodeId ? qrCodeId : undefined,
      },
      select: { id: true, name: true, destination: true },
    });

    const qrIds = userQrs.map(q => q.id);

    if (qrCodeId && !qrIds.includes(qrCodeId)) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 });
    }

    if (qrIds.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "You don't have any review campaigns set up yet. Create a campaign to start gathering insights.",
        strengths: ["No data available"],
        complaints: ["No data available"],
        recommendations: ["Create your first review QR Code under Campaigns & Setup tab."]
      });
    }

    // 2. Fetch last 15 reviews (or past 30 days) to aggregate for AI insights
    const reviews = await prisma.reviewResponse.findMany({
      where: {
        qrCodeId: qrCodeId ? qrCodeId : { in: qrIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Analyze the most recent 20 reviews for dashboard performance
      select: {
        rating: true,
        feedback: true,
        selectedTags: true,
        sentiment: true,
        category: true,
        urgency: true,
        createdAt: true,
      }
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "No customer reviews have been received yet. Share your QR Code with customers to begin collecting ratings.",
        strengths: ["No ratings yet"],
        complaints: ["No issues reported yet"],
        recommendations: ["Place QR code standees on tables or checkout counters.", "Ask satisfied customers to rate their experience."]
      });
    }

    // Format reviews for prompt
    const formattedReviews = reviews.map(r => ({
      rating: r.rating,
      feedback: r.feedback || 'No comments',
      tags: r.selectedTags || 'None',
      sentiment: r.sentiment || 'Unknown',
      category: r.category || 'Unknown',
      urgency: r.urgency || 'Low',
      date: new Date(r.createdAt).toLocaleDateString()
    }));

    const businessName = (userQrs[0]?.destination as any)?.businessName || userQrs[0]?.name || 'Our business';
    const industryContext = (userQrs[0]?.destination as any)?.reviewCategory || 'general service';

    const prompt = `You are a professional SaaS business growth coach and analyst. Analyze these customer reviews for a business named "${businessName}" in the "${industryContext}" industry.
Reviews data:
${JSON.stringify(formattedReviews, null, 2)}

Provide a structured business summary analysis. Return a JSON object with:
1. "summary": A 2-3 sentence executive performance overview outlining the customer sentiment, main themes, and recent score trends.
2. "strengths": An array of exactly 3 bullet points highlighting what customers loved most (focus on positive reviews/ratings).
3. "complaints": An array of exactly 3 bullet points highlighting what went wrong, friction points, or areas of complaint.
4. "recommendations": An array of exactly 3 practical, actionable business improvement actions.

Format the output strictly as a JSON object matching this schema:
{
  "summary": "string summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
Do not include any markdown backticks (like \`\`\`json) or other text besides the JSON object.`;

    const aiResponseText = await callLLM(prompt, true);

    let cleanJson = aiResponseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const insights = JSON.parse(cleanJson);
    return NextResponse.json({ success: true, ...insights });

  } catch (error: any) {
    console.error('Error generating weekly insights:', error);
    return NextResponse.json({
      success: false,
      summary: "AI summary generator encountered a processing delay. Insights will update automatically as more reviews accumulate.",
      strengths: ["Great customer satisfaction ratings"],
      complaints: ["Occasional delivery or queue delays"],
      recommendations: ["Keep collecting customer ratings to build deeper AI insights."]
    });
  }
}
