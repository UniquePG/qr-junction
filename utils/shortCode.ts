import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function generateUniqueShortCode(): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    
    // Check if the short code is already taken in the database
    const existing = await prisma.qRCode.findUnique({
      where: { shortCode: code },
    });
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
}
