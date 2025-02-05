// src/middleware/roleMiddleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';
import type { UserRole } from '@/app/types/auth';

export async function roleMiddleware(req: NextRequest, requiredRole: UserRole) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Verificar el token usando Firebase Admin
    const decodedToken = await adminAuth.verifySessionCookie(token, true);
    const user = await adminAuth.getUser(decodedToken.uid);

    // Verificar el rol del usuario
    const userRole = user.customClaims?.role as UserRole;

    if (!userRole || userRole !== requiredRole) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Si todo está bien, continuar
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.uid);
    requestHeaders.set('x-user-role', userRole);

    return NextResponse.next({
      request: { headers: requestHeaders }
    });

  } catch (error) {
    console.error('Role middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}