import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "./src/app/lib/firebase/config.ts";

// Inicializar Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const email = "correo@ejemplo.com"; // Usa un correo válido
const password = "contraseña123"; // Usa una contraseña válida
const uid = "h8oZwNWEBbZtxOgBsSyVSvH4rQ92"; // UID del usuario a crear

async function createFirestoreUser() {
  try {
    console.log("🔑 Iniciando sesión antes de escribir en Firestore...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Autenticación exitosa:", userCredential.user.uid);

    console.log(`🔍 Verificando permisos en Firestore para UID: ${userCredential.user.uid}`);
    const userRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log("✅ Usuario encontrado en Firestore:", userDoc.data());
    } else {
      console.log("❌ Usuario NO encontrado en Firestore. Intentando crearlo...");
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        displayName: "Usuario",
        role: "client",
        permissions: [],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log("✅ Usuario creado exitosamente en Firestore.");
    }
  } catch (error) {
    console.error("❌ Error al acceder a Firestore:", error);
  }
}

createFirestoreUser();
