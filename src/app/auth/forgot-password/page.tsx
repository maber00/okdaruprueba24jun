'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/app/lib/firebase';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            setError('No existe una cuenta con este email');
            break;
          case 'auth/invalid-email':
            setError('El email ingresado no es válido');
            break;
          default:
            setError('Ocurrió un error al enviar el email de recuperación');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Se ha enviado un email con instrucciones para recuperar tu contraseña.
              Por favor revisa tu bandeja de entrada.
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <div className="text-center">
                <Link 
                  href="/auth/login" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}