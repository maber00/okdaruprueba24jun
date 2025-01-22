// src/app/lib/firebase/init.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  connectAuthEmulator,
  type Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  type Firestore 
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator,
  type FirebaseStorage 
} from 'firebase/storage';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseDb: Firestore;
let firebaseStorage: FirebaseStorage;

export function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    // Configurar emuladores solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      try {
        // Auth emulator debe conectarse primero
        connectAuthEmulator(firebaseAuth, 'http://localhost:9099', {
          disableWarnings: true
        });
        console.log('✅ Conectado al emulador de Auth');

        // Luego conectar Firestore
        connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
        console.log('✅ Conectado al emulador de Firestore');

        // Finalmente conectar Storage
        connectStorageEmulator(firebaseStorage, 'localhost', 9199);
        console.log('✅ Conectado al emulador de Storage');
        
        // Configurar persistencia después de conectar emuladores
        setPersistence(firebaseAuth, browserLocalPersistence)
          .then(() => console.log('✅ Persistencia configurada'))
          .catch(console.error);

      } catch (error) {
        console.error('❌ Error conectando a emuladores:', error);
      }
    }
  } else {
    firebaseApp = getApps()[0];
    firebaseAuth = getAuth();
    firebaseDb = getFirestore();
    firebaseStorage = getStorage();
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage
  };
}

export function getFirebaseInstances() {
  // Si las instancias no están inicializadas, inicializarlas
  if (!firebaseApp) {
    return initializeFirebase();
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage
  };
}