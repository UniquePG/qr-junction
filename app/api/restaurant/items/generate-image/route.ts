import { NextResponse } from 'next/server';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREAT || process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemName } = body;

    if (!itemName || !itemName.trim()) {
      return NextResponse.json({ error: 'Menu item name is required' }, { status: 400 });
    }

    // Construct an optimized, highly realistic food photography prompt
    const promptText = `${itemName.trim()}, professional food photography, high resolution, detailed, studio lighting, appetizing, delicious, centered, 1:1 ratio`;

    let imageBuffer: Buffer | null = null;
    let usedProvider = '';

    // 1. Try Pollinations.ai with flux-realism model
    try {
      console.log('Attempting Pollinations.ai image generation with flux-realism model...');
      const response = await fetch(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=512&height=512&nologo=true&private=true&enhance=false&model=flux-realism`,
        { method: 'GET' }
      );
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        usedProvider = 'pollinations-realism';
      } else {
        console.warn('Pollinations flux-realism model failed, code:', response.status);
      }
    } catch (err) {
      console.error('Error with Pollinations flux-realism model:', err);
    }

    // 2. Fallback to Pollinations.ai default flux model if realism failed
    if (!imageBuffer) {
      try {
        console.log('Attempting Pollinations.ai image generation with default flux model...');
        const response = await fetch(
          `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=512&height=512&nologo=true&private=true&enhance=false&model=flux`,
          { method: 'GET' }
        );
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          usedProvider = 'pollinations-flux';
        } else {
          console.warn('Pollinations default flux model failed, code:', response.status);
        }
      } catch (err) {
        console.error('Error with Pollinations default flux model:', err);
      }
    }

    // 3. Fallback to Hugging Face Inference API if Pollinations failed and Hugging Face token is available
    const hfToken = process.env.HUGGINFACE_TOKEN || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!imageBuffer && hfToken) {
      try {
        console.log('Attempting Hugging Face image generation (FLUX.1-schnell)...');
        const response = await fetch(
          'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: promptText }),
          }
        );
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          usedProvider = 'huggingface-flux-schnell';
        } else {
          const errMsg = await response.text();
          console.warn('Hugging Face FLUX model failed, details:', errMsg);
        }
      } catch (err) {
        console.error('Error with Hugging Face FLUX model:', err);
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({ error: 'AI Image Generation service is currently unavailable. Please try again later.' }, { status: 500 });
    }

    console.log(`Successfully generated image using ${usedProvider}. Uploading to Cloudinary...`);

    // Convert file to base64 Data URI for Cloudinary upload
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Upload to Cloudinary under "qrjunction" folder
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'qrjunction',
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      provider: usedProvider
    });
  } catch (error: any) {
    console.error('AI Image generation endpoint error:', error);
    return NextResponse.json(
      { error: 'Image generation failed', details: error.message },
      { status: 500 }
    );
  }
}
