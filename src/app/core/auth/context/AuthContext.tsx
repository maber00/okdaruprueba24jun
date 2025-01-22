// src/app/core/auth/context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase, getFirebaseInstances } from '@/app/lib/firebase/init';
import type { AuthUser } from '@/app/types/auth';
import { authLogger } from '@/app/lib/logger';


interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null
});



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initializeFirebase();
        const { auth, db } = getFirebaseInstances();

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          try {
            setLoading(true);
            authLogger.info('AuthProvider', 'Cambio en estado de autenticación', 
              fbUser ? `Usuario: ${fbUser.uid}` : 'Usuario: null');

            if (fbUser) {
              setFirebaseUser(fbUser);
              const userDocRef = doc(db, 'users', fbUser.uid);
              
              const userDocSnap = await getDoc(userDocRef);
              
              if (!userDocSnap.exists()) {
                const newUser: AuthUser = {
                  uid: fbUser.uid,
                  email: fbUser.email,
                  displayName: fbUser.displayName,
                  role: 'client',
                  permissions: [],
                  status: 'active',
                  metadata: {},
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                setUser(newUser);
              } else {
                setUser(userDocSnap.data() as AuthUser);
              }
              setError(null);
            } else {
              setFirebaseUser(null);
              setUser(null);
              setError(null);
            }
          } catch (err) {
            authLogger.error('AuthProvider', 'Error en autenticación', err);
            setError('Error en autenticación');
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        authLogger.error('AuthProvider', 'Error inicializando Firebase', err);
        setError('Error inicializando autenticación');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}