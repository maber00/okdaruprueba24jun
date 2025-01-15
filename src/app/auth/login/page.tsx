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
import { authLogger } from '@/app/lib/logger';

const REDIRECT_URL = '/dashboard';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authLogger.info('LoginPage', 'Comprobando estado de autenticación', { isAuthenticated: !!user });

    if (user) {
      authLogger.info('LoginPage', 'Redirigiendo usuario autenticado', {
        destination: REDIRECT_URL,
        userId: user.uid
      });
      router.replace(REDIRECT_URL);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    authLogger.info('LoginPage', 'Intento de login', { email });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authLogger.info('LoginPage', 'Login exitoso', { 
        userId: userCredential.user.uid 
      });

    } catch (err) {
      authLogger.error('LoginPage', 'Error en login', err);
      
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('Email o contraseña incorrectos');
            break;
          case 'auth/too-many-requests':
            setError('Demasiados intentos fallidos. Por favor, intenta más tarde');
            break;
          case 'auth/user-disabled':
            setError('Esta cuenta ha sido deshabilitada');
            break;
          default:
            setError('Error al iniciar sesión. Por favor, intenta nuevamente');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si el usuario está autenticado, mostramos el loader
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}