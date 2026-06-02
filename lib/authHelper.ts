import { adminAuth } from './firebaseAdmin';
import { prisma } from './prisma';

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken?.uid || null;
  } catch (error) {
    console.error('Error verifying token in request:', error);
    return null;
  }
}

export async function getDbUserFromRequest(request: Request) {
  const firebaseUid = await getUserIdFromRequest(request);
  if (!firebaseUid) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    return user;
  } catch (error) {
    console.error('Error getting DB user from request:', error);
    return null;
  }
}

export async function getDbUserIdFromRequest(request: Request): Promise<number | null> {
  const user = await getDbUserFromRequest(request);
  return user?.id || null;
}
