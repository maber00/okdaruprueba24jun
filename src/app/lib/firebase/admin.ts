// src/app/lib/firebase/admin.ts
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error(
    'Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
  );
}

// Solo inicializar si no hay aplicaciones ya inicializadas
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

export default admin;