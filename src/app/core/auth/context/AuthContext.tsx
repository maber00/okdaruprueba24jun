// src/app/core/auth/context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import type { AuthUser } from '@/app/types/auth';

// Definir el tipo del contexto
type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
};

// Crear el contexto con un valor inicial
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado simple sin nesting
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listener');
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
  
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
  
        if (!userDoc.exists()) {
          // Crear el documento del usuario si no existe
          const newUserData: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'client',
            permissions: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
              company: '',
              position: '',
              phone: ''
            }
          };
  
          await setDoc(userRef, newUserData);
          setUser(newUserData);
        } else {
          const userData = userDoc.data() as AuthUser;
          setUser({
            ...userData,
            uid: firebaseUser.uid
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);
  
  

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}