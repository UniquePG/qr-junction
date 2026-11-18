import { NextResponse } from 'next/server';
import { generateDishImage } from '@/lib/ai';
import { v2 as cloudinary } from 'cloudinary';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';

export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREAT || process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, ['menu.create', 'menu.update']);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { itemName } = body;

    if (!itemName || !itemName.trim()) {
      return NextResponse.json({ error: 'Menu item name is required' }, { status: 400 });
    }

    const promptText = `${itemName.trim()}, professional food photography, high resolution, detailed, studio lighting, appetizing, delicious, centered, 1:1 ratio`;

    let generated;
    try {
      generated = await generateDishImage(promptText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Image] All providers failed:', message);
      return NextResponse.json(
        { error: 'AI Image Generation service is currently unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    console.log(`Successfully generated image using ${generated.provider}/${generated.model}. Uploading to Cloudinary...`);

    const base64Image = `data:image/png;base64,${generated.buffer.toString('base64')}`;
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'qrjunction',
    });

    auditFromContext(auth.ctx, {
      action: 'item.image_generate',
      resourceType: 'menu_item',
      summary: `Generated an AI image for “${String(itemName).trim().slice(0, 80)}”`,
      meta: { provider: generated.provider },
      ip: clientIp(request),
    });
    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      provider: generated.provider,
    });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Image generation failed');
  }
}
