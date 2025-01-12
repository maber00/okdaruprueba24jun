// src/app/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const initializeFirebase = () => {
  try {
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      // Usar localStorage en lugar de IndexedDB
      setPersistence(auth, browserLocalPersistence);
      return app;
    }
    return getApps()[0];
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

const app = initializeFirebase();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;