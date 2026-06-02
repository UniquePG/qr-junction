import * as admin from 'firebase-admin';

let adminAuth: any;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin SDK initialization failed:', error);
    }
  }
  adminAuth = admin.auth();
} else {
  // Graceful fallback for local development if Firebase variables are not set yet
  adminAuth = {
    verifyIdToken: async (token: string) => {
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.warn('Firebase Admin SDK credentials not configured. Using development mock verification.');
        if (token && token.startsWith('mock_')) {
          const parts = token.split('_');
          return {
            uid: parts[1] || 'mock-user-uid',
            email: parts[2] || 'mock@example.com',
            name: parts[3] ? decodeURIComponent(parts[3]) : 'Mock User',
            email_verified: true,
            picture: 'https://lh3.googleusercontent.com/a/default-user',
          };
        }
        return {
          uid: 'mock-user-uid',
          email: 'mock@example.com',
          name: 'Mock User',
          email_verified: true,
          picture: 'https://lh3.googleusercontent.com/a/default-user',
        };
      }
      throw new Error('Firebase Admin environment variables are missing.');
    },
  };
}

export { adminAuth };
