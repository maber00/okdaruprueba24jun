// src/app/api/auth/create-session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/app/lib/firebase/admin'; // Corregir path
import { authLogger } from '@/app/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    // Crear cookie de sesión
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Esperar por la instancia de cookies
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (serverError) {
    // Usar el logger para el error
    authLogger.error('create-session', 'Error creando sesión', serverError);

    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 401 }
    );
  }
}