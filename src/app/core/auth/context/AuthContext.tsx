// src/app/core/auth/context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import type { AuthUser } from '@/app/types/auth';
import { useToast } from '@/app/shared/hooks/useToast';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthContextType = {
  user: null,
  firebaseUser: null,
  loading: true,
  error: null
};

export const AuthContext = createContext<AuthContextType>(initialState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>(initialState);
  const { toast } = useToast();

  useEffect(() => {
    let userDataUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          // Get user token for API requests
          const token = await fbUser.getIdToken();
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; secure; samesite=strict`;

          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create new user document
            const userData = {
              email: fbUser.email,
              displayName: fbUser.displayName,
              role: 'client',
              permissions: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await setDoc(userDocRef, userData);
            setState({
              user: {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                role: 'client',
                permissions: []
              },
              firebaseUser: fbUser,
              loading: false,
              error: null
            });
          } else {
            // Subscribe to user document changes
            userDataUnsubscribe = onSnapshot(userDocRef, 
              (doc) => {
                if (doc.exists()) {
                  const userData = doc.data();
                  setState({
                    user: {
                      uid: fbUser.uid,
                      email: fbUser.email,
                      displayName: fbUser.displayName,
                      role: userData.role,
                      permissions: userData.permissions || []
                    },
                    firebaseUser: fbUser,
                    loading: false,
                    error: null
                  });
                }
              },
              (error) => {
                console.error('Error in user document snapshot:', error);
                toast({
                  message: 'Error al sincronizar datos del usuario'
                });
              }
            );
          }
        } else {
          // User is signed out
          if (userDataUnsubscribe) {
            userDataUnsubscribe();
          }
          document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setState(initialState);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Error al autenticar usuario'
        }));
        toast({
          message: 'Error de autenticación'
        });
      }
    });

    return () => {
      authUnsubscribe();
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
      }
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}