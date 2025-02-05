import dotenv from "dotenv";
dotenv.config();
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "./src/app/lib/firebase/config.ts"; // 📌 Asegura que la ruta sea correcta

// Inicializar Firebase solo si no está inicializado
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 📌 Datos de prueba
const email = "correo@ejemplo.com";
const password = "contraseña123";
const uid = "TU_UID"; // Reemplázalo con el UID real del usuario

async function checkUser() {
  try {
    console.log("🔍 Intentando autenticación...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Usuario autenticado:", userCredential.user.uid);

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log("✅ Usuario encontrado en Firestore:", userDoc.data());
    } else {
      console.log("❌ Usuario NO encontrado en Firestore.");
    }
  } catch (error) {
    console.error("❌ Error al obtener usuario en Firestore:", error);
  }
}

checkUser();
