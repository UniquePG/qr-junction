import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREAT || process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file to base64 Data URI for Cloudinary upload
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary under "qrjunction" folder
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'qrjunction',
    });

    return NextResponse.json({ 
      success: true, 
      url: uploadResponse.secure_url 
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message }, 
      { status: 500 }
    );
  }
}
