// src/app/core/auth/context/AuthContext.tsx
'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import type { AuthUser } from '@/app/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const unsubscribeUser = onSnapshot(
          doc(db, 'users', fbUser.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                role: userData.role,
                permissions: userData.permissions || []
              });
            }
            setLoading(false);
          }
        );

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}