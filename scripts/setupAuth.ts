// scripts/setupAuth.ts
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';
import admin from 'firebase-admin';


const app = initializeApp({
  projectId: "demo-project",
  apiKey: "demo-key"
});

admin.initializeApp({
  projectId: "daru-cfcd1"
});

const auth = getAuth(app);
const db = getFirestore(app);

// Conectar a los emuladores
connectAuthEmulator(auth, 'http://localhost:9099');
connectFirestoreEmulator(db, 'localhost', 8080);

async function setupTestUser() {
  try {
    // Crear usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@test.com',
      'password123'
    );

    // Crear documento de usuario en Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: 'admin@test.com',
      role: 'admin',
      displayName: 'Admin User',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Usuario de prueba creado:', userCredential.user.uid);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}



setupTestUser()
  .then(() => {
    console.log('Setup completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en setup:', error);
    process.exit(1);
  });

  