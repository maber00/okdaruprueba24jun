import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhOOYRX8II2ejFp3kWdl4ZWVAYoUjWBAQ",
  authDomain: "TU_AUTH_DOMAIN.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "1067491263398",
  appId: "1:1067491263398:web:e3d1b558f7b647907d0567",
  measurementId: "G-XEJH3BVZWB"
};

// Asegurar que Firebase no se inicialice más de una vez
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Intentar iniciar sesión con el usuario existente
signInWithEmailAndPassword(auth, "correo@ejemplo.com", "contraseña123")
  .then((userCredential) => {
    console.log("✅ Inicio de sesión exitoso:", userCredential.user);
  })
  .catch((error) => {
    console.error("❌ Error iniciando sesión:", error.code, error.message);
  });
