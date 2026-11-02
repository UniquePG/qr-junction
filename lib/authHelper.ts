import { adminAuth } from './firebaseAdmin';
import { isOAuthProvider } from './otp';
import { getEmailVerified } from './otpDb';
import { prisma } from './prisma';

export async function getDecodedTokenFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying token in request:', error);
    return null;
  }
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const decodedToken = await getDecodedTokenFromRequest(request);
  return decodedToken?.uid || null;
}

async function dbUserFromFirebaseUid(firebaseUid: string) {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
  });
  if (!user) return null;
  const emailVerified = await getEmailVerified(user.id);
  if (!emailVerified && !isOAuthProvider(user.provider)) {
    return null;
  }
  return { ...user, emailVerified };
}

export async function getDbUserFromRequest(request: Request) {
  const firebaseUid = await getUserIdFromRequest(request);
  if (!firebaseUid) return null;

  try {
    return await dbUserFromFirebaseUid(firebaseUid);
  } catch (error) {
    console.error('Error getting DB user from request:', error);
    return null;
  }
}

export async function getDbUserIdFromIdToken(idToken: string): Promise<number | null> {
  const token = idToken.trim();
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const firebaseUid = decoded?.uid;
    if (!firebaseUid) return null;
    const user = await dbUserFromFirebaseUid(firebaseUid);
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function getDbUserIdFromRequest(request: Request): Promise<number | null> {
  const user = await getDbUserFromRequest(request);
  return user?.id || null;
}
