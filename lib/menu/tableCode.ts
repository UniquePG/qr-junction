import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Opaque table code for the public menu URL. AES-256-GCM over { tableId, restaurantId }.
 * Output: base64url(iv[12] | tag[16] | ciphertext). No expiry.
 */

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const explicit = process.env.TABLE_CODE_SECRET;
  if (explicit) {
    cachedKey = createHash('sha256').update(explicit).digest();
    return cachedKey;
  }
  let base = process.env.AUTH_SECRET;
  if (!base) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TABLE_CODE_SECRET or AUTH_SECRET is required in production');
    }
    base = 'dev-only-auth-secret-change-me';
  }
  cachedKey = Buffer.from(hkdfSync('sha256', base, '', 'qrj-table-code-v1', 32));
  return cachedKey;
}

export function encryptTableCode(input: { tableId: number; restaurantId: number }): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const plain = Buffer.from(JSON.stringify({ t: input.tableId, r: input.restaurantId }), 'utf8');
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64url');
}

export function decryptTableCode(code: unknown): { tableId: number; restaurantId: number } | null {
  try {
    if (typeof code !== 'string' || code.length < 40 || code.length > 200) return null;
    if (!/^[A-Za-z0-9_-]+$/.test(code)) return null;
    const buf = Buffer.from(code, 'base64url');
    if (buf.length < 12 + 16 + 1) return null;
    const decipher = createDecipheriv('aes-256-gcm', getKey(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(plain);
    const tableId = Number(parsed?.t);
    const restaurantId = Number(parsed?.r);
    if (!Number.isInteger(tableId) || !Number.isInteger(restaurantId)) return null;
    return { tableId, restaurantId };
  } catch {
    return null;
  }
}

export type ResolvedTable = { id: number; tableNumber: string; menuId: number | null };

/** Decrypts the code and confirms the table still exists in this restaurant. */
export async function resolveTableFromCode(code: unknown, restaurantId: number): Promise<ResolvedTable | null> {
  const payload = decryptTableCode(code);
  if (!payload || payload.restaurantId !== restaurantId) return null;
  const table = await prisma.restaurantTable.findFirst({
    where: { id: payload.tableId, restaurantId },
    select: { id: true, tableNumber: true, menuId: true },
  });
  return table ?? null;
}
