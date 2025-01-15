'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
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
    authLogger.info('AuthProvider', 'Iniciando setup de auth listener');
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        authLogger.info('AuthProvider', 'Cambio en estado de autenticación', 
          fbUser ? `Usuario: ${fbUser.uid}` : 'Usuario: null');

        if (fbUser) {
          setFirebaseUser(fbUser);
          const userDocRef = doc(db, 'users', fbUser.uid);
          authLogger.info('AuthProvider', 'Verificando documento de usuario en Firestore');
          
          try {
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
              authLogger.info('AuthProvider', 'Creando nuevo documento de usuario');
              const userData = {
                email: fbUser.email,
                displayName: fbUser.displayName,
                role: 'client',
                permissions: [],
                createdAt: new Date()
              };
              
              await setDoc(userDocRef, userData);
              authLogger.info('AuthProvider', 'Documento de usuario creado exitosamente');
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                role: 'client',
                permissions: []
              });
              setLoading(false);
            } else {
              authLogger.info('AuthProvider', 'Configurando listener de datos de usuario');
              if (unsubscribeUser) {
                unsubscribeUser();
                authLogger.info('AuthProvider', 'Limpiando subscripción anterior');
              }

              unsubscribeUser = onSnapshot(
                userDocRef,
                {
                  next: (docSnap) => {
                    if (docSnap.exists()) {
                      const userData = docSnap.data();
                      authLogger.info('AuthProvider', 'Datos de usuario actualizados', {
                        uid: fbUser.uid,
                        role: userData.role
                      });
                      setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName,
                        role: userData.role,
                        permissions: userData.permissions || []
                      });
                    }
                    setError(null);
                    setLoading(false);
                  },
                  error: (error) => {
                    authLogger.error('AuthProvider', 'Error en snapshot de usuario', error);
                    setError('Error al sincronizar datos del usuario');
                    setLoading(false);
                  }
                }
              );
            }
          } catch (error) {
            authLogger.error('AuthProvider', 'Error accediendo a Firestore', error);
            setError('Error al acceder a la base de datos');
            setLoading(false);
          }
        } else {
          // Usuario no autenticado
          authLogger.info('AuthProvider', 'Usuario no autenticado, limpiando estado');
          if (unsubscribeUser) {
            unsubscribeUser();
            unsubscribeUser = undefined;
          }
          setFirebaseUser(null);
          setUser(null);
          setError(null);
          setLoading(false);
        }
      } catch (error) {
        authLogger.error('AuthProvider', 'Error en proceso de autenticación', error);
        setError('Error en el proceso de autenticación');
        setLoading(false);
      }
    });

    return () => {
      authLogger.info('AuthProvider', 'Limpiando subscripciones de auth');
      if (unsubscribeUser) {
        unsubscribeUser();
      }
      unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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