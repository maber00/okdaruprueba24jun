// src/app/lib/firebase/index.ts
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { type FirebaseStorage } from 'firebase/storage';
import { initializeFirebase } from './init';

const { app, auth, db, storage } = initializeFirebase();

export { app, auth, db, storage };
export type { FirebaseApp, Auth, Firestore, FirebaseStorage };

// Re-exportar configuración
export { firebaseConfig } from './config';