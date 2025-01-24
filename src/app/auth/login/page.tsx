'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/app/lib/firebase';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { useToast } from '@/app/shared/hooks/useToast';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Nombre corregido
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user) { // Uso correcto de isLoading
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]); // Actualización del array de dependencias

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Asegura que isLoading se actualice correctamente
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();

      document.cookie = `firebase-token=${token}; path=/`;
      router.replace('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof FirebaseError
          ? getFirebaseErrorMessage(error.code)
          : 'Error al iniciar sesión';
      setError(errorMessage);
      toast({ message: errorMessage });
    } finally {
      setIsLoading(false); // Restablece isLoading al finalizar
    }
  };

  function getFirebaseErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/user-not-found': 'Email o contraseña incorrectos',
      'auth/wrong-password': 'Email o contraseña incorrectos',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, intenta más tarde',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    };
    return errorMessages[code] || 'Error al iniciar sesión. Por favor, intenta nuevamente';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
              Regístrate
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              disabled={isLoading} // Bloquea los inputs mientras carga
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={isLoading} // Bloquea los inputs mientras carga
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
