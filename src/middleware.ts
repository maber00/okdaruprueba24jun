// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authLogger } from '@/app/lib/logger';

export async function middleware(request: NextRequest) {
  try {
    // Permitir rutas públicas
    if (
      request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname === '/'
    ) {
      return NextResponse.next();
    }

    // Obtener el token de Firebase de las cookies
    const authToken = request.cookies.get('firebase-token');

    if (!authToken) {
      authLogger.warn('middleware', 'No auth token found');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Las rutas protegidas son manejadas por el AuthContext
    return NextResponse.next();
  } catch (middlewareError) {
    authLogger.error('middleware', 'Error in middleware', middlewareError);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
};