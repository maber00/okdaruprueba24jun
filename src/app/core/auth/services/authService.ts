// src/app/core/auth/services/authService.ts
import { 
  signInWithEmailAndPassword, 
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import type { UserRole } from '@/app/types/auth';
import { authLogger } from '@/app/lib/logger';
// Constantes para rutas
const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard'
} as const;

export const authService = {
  async login(email: string, password: string) {
    try {
      authLogger.info('AuthService', 'Iniciando login', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Obtener datos adicionales del usuario
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      authLogger.info('AuthService', 'Login exitoso', { 
        uid: userCredential.user.uid,
        hasUserData: userDoc.exists()
      });

      return {
        user: userCredential.user,
        userData: userDoc.data()
      };
    } catch (error) {
      authLogger.error('AuthService', 'Error en login', error);
      throw error;
    }
  },

  async register(email: string, password: string, displayName: string) {
    try {
      authLogger.info('AuthService', 'Iniciando registro', { email, displayName });
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con displayName
      await updateProfile(userCredential.user, { displayName });

      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        role: 'client' as UserRole,
        createdAt: new Date(),
        lastLogin: new Date(),
        permissions: []
      });

      authLogger.info('AuthService', 'Registro exitoso', { 
        uid: userCredential.user.uid 
      });

      return userCredential.user;
    } catch (error) {
      authLogger.error('AuthService', 'Error en registro', error);
      throw error;
    }
  },

  async logout() {
    try {
      authLogger.info('AuthService', 'Iniciando logout');
      
      // Obtener UID antes del signOut para logging
      const uid = auth.currentUser?.uid;
      
      await signOut(auth);
      
      authLogger.info('AuthService', 'Logout exitoso', { uid });
      
      // Usar window.location.replace para forzar un refresh completo
      window.location.replace(ROUTES.LOGIN);
    } catch (error) {
      authLogger.error('AuthService', 'Error en logout', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      authLogger.info('AuthService', 'Iniciando reset de password', { email });
      
      await sendPasswordResetEmail(auth, email);
      
      authLogger.info('AuthService', 'Email de reset enviado', { email });
    } catch (error) {
      authLogger.error('AuthService', 'Error en reset de password', error);
      throw error;
    }
  },

  async updateUserProfile(user: FirebaseUser, data: Partial<{ displayName: string; photoURL: string }>) {
    try {
      authLogger.info('AuthService', 'Iniciando actualización de perfil', { 
        uid: user.uid,
        updateData: data 
      });

      await updateProfile(user, data);
      
      // Actualizar también en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });

      authLogger.info('AuthService', 'Perfil actualizado exitosamente', {
        uid: user.uid
      });
    } catch (error) {
      authLogger.error('AuthService', 'Error actualizando perfil', error);
      throw error;
    }
  },

  // Método para verificar el estado actual de la sesión
  async getCurrentSession() {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      authLogger.info('AuthService', 'No hay sesión activa');
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      authLogger.info('AuthService', 'Sesión activa recuperada', {
        uid: currentUser.uid,
        hasUserData: userDoc.exists()
      });

      return {
        user: currentUser,
        userData: userDoc.data()
      };
    } catch (error) {
      authLogger.error('AuthService', 'Error recuperando sesión', error);
      throw error;
    }
  },
  async getIdToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        authLogger.info('AuthService', 'No hay usuario para obtener token');
        return null;
      }
  
      const token = await currentUser.getIdToken();
      return token;
    } catch (error) {
      authLogger.error('AuthService', 'Error obteniendo token', error);
      return null;
    }
  },
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      // Intentar primero con popup
      return await signInWithPopup(auth, provider);
    } catch (popupError) {
      authLogger.warn('AuthService', 'Error en popup, intentando redirect', popupError);
      // Si falla el popup, usar redirect como fallback
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        authLogger.error('AuthService', 'Error en redirect auth', redirectError);
        throw redirectError;
      }
    }
  },

  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // Procesar resultado del redirect
        return result;
      }
      return null;
    } catch (error) {
      authLogger.error('AuthService', 'Error manejando resultado de redirect', error);
      throw error;
    }
  },
};