// src/app/api/auth/verify-session/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';
import { authLogger } from '@/app/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userRecord = await adminAuth.getUser(decodedToken.uid);

    authLogger.info('verify-session', 'Session verified successfully', {
      uid: decodedToken.uid
    });

    return NextResponse.json({
      uid: decodedToken.uid,
      role: userRecord.customClaims?.role || 'client',
    });
  } catch (verifyError) {
    authLogger.error('verify-session', 'Error verifying session', verifyError);
    
    return NextResponse.json(
      { error: 'Sesión inválida' },
      { status: 401 }
    );
  }
}