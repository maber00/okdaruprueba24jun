// src/app/core/auth/services/authService.ts
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type User as FirebaseUser 
  } from 'firebase/auth';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { auth, db } from '@/app/lib/firebase';
  import type { UserRole } from '@/app/types/auth';
  
  export const authService = {
    async login(email: string, password: string) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      return {
        user: userCredential.user,
        userData: userDoc.data()
      };
    },
  
    async register(email: string, password: string, displayName: string) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil de usuario
      await updateProfile(userCredential.user, {
        displayName
      });
  
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        role: 'client' as UserRole,
        createdAt: new Date()
      });
  
      return userCredential.user;
    },
  
    async logout() {
      await signOut(auth);
    },
  
    async resetPassword(email: string) {
      await sendPasswordResetEmail(auth, email);
    },
  
    async updateUserProfile(user: FirebaseUser, data: Partial<{ displayName: string; photoURL: string }>) {
      await updateProfile(user, data);
    }
  };