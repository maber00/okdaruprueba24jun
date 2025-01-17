// src/app/lib/firebase/auth.ts
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    type User
  } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import { auth, db } from './index';
  import type { UserRole } from '@/app/types/auth';
  
  export async function signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
  
  export async function signUp(email: string, password: string, role: UserRole = 'client') {
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
  
  export async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  
  export async function logOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  export function getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  }