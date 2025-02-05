// test-firestore.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID"
};

// Inicializar Firebase solo si no está inicializado
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Crear un usuario de prueba en Firestore
const testUserRef = doc(db, "users", "test-user");

setDoc(testUserRef, {
  email: "test@ejemplo.com",
  createdAt: new Date().toISOString(),
  role: "user"
})
  .then(() => console.log("✅ Usuario de prueba creado en Firestore"))
  .catch((error) => console.error("❌ Error al guardar usuario en Firestore:", error));
