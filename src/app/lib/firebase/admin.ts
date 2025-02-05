import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // 🔥 Conversión necesaria
};

// Verificar si la clave se está cargando correctamente
console.log("🔍 Cargando credenciales de Firebase Admin:");
console.log("📌 Project ID:", serviceAccount.projectId);
console.log("📌 Client Email:", serviceAccount.clientEmail);
console.log("📌 Private Key está definida:", !!serviceAccount.privateKey);

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

/**
 * **Asigna un rol personalizado a un usuario**
 * @param {string} uid - ID del usuario en Firebase
 * @param {string} role - Rol a asignar (ejemplo: 'admin', 'user').
 */
export async function assignCustomClaims(uid: string, role: string) {
  await adminAuth.setCustomUserClaims(uid, { role });
}

/**
 * **Obtiene el rol de un usuario**
 * @param {string} uid - ID del usuario en Firebase
 * @returns {Promise<string | null>}
 */
export async function getUserRole(uid: string): Promise<string | null> {
  const user = await adminAuth.getUser(uid);
  return (user.customClaims?.role as string) || null;
}
