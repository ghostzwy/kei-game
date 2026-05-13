import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://kei-project-cbbc4-default-rtdb.firebaseio.com"
      });
    } else {
      // Fallback for local development if env is not set
      admin.initializeApp({
        databaseURL: "https://kei-project-cbbc4-default-rtdb.firebaseio.com"
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.database();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
