// src/app/lib/firebase/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
  type UserCredential
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './index';
import type { UserRole } from '@/app/types/auth';

interface CreateUserData {
  email: string;
  password: string; // 
  displayName?: string | null;
  role?: UserRole;
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'client'
): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Crear documento de usuario
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return result.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    // 1️⃣ Crear usuario en Firebase Authentication
    const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    // 2️⃣ Guardar información adicional en Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      email: userData.email,
      displayName: userData.displayName || null,
      role: userData.role || "client", // Si no se pasa un rol, se asigna "client" por defecto
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log("✅ Usuario creado correctamente:", result.user);

    return result.user;
  } catch (error) {
    console.error("❌ Error al crear el usuario:", error);
    throw error;
  }
}
