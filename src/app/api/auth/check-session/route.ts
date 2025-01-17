// src/app/api/auth/check-session/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin'; // Corregir path
import { authLogger } from '@/app/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { session } = await request.json();
    
    // Verificar el token de sesión
    const decodedToken = await adminAuth.verifySessionCookie(session, true);
    
    return NextResponse.json({
      status: 'authenticated',
      uid: decodedToken.uid
    });
  } catch (serverError) {
    // Usar el logger para el error
    authLogger.error('check-session', 'Error verificando sesión', serverError);

    return NextResponse.json(
      { 
        status: 'unauthenticated',
        error: 'Sesión inválida'
      },
      { status: 401 }
    );
  }
}