// src/app/lib/firebase/init.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined; 
let storage: FirebaseStorage | undefined;

export function initializeFirebase() {
 if (!getApps().length) {
   app = initializeApp(firebaseConfig);
   auth = getAuth(app);
   db = getFirestore(app);
   storage = getStorage(app);
 }

 return { 
   app: app as FirebaseApp,
   auth: auth as Auth,
   db: db as Firestore,
   storage: storage as FirebaseStorage 
 };
}
export function getFirebaseInstances() {
  return app ? { 
    app: app as FirebaseApp,
    auth: auth as Auth,
    db: db as Firestore, 
    storage: storage as FirebaseStorage
  } : initializeFirebase();
 }
 if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}