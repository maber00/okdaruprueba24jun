// src/app/middleware/withRoleCheck.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/app/types/auth';

export function withRoleCheck(allowedRoles: UserRole[]) {
  return async function middleware(request: NextRequest) {
    try {
      const token = request.cookies.get('session')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Verificar token a través de la API
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!verifyResponse.ok) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const { uid } = await verifyResponse.json();

      // Obtener rol del usuario
      const userResponse = await fetch(`${request.nextUrl.origin}/api/users/${uid}`);
      const userData = await userResponse.json();

      if (!userData || !allowedRoles.includes(userData.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Role check error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  };
}