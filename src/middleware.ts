// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
 const token = request.cookies.get('auth-token');
 const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
 const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

 // Si no hay token y está intentando acceder al dashboard
 if (!token && isDashboardPage) {
   return NextResponse.redirect(new URL('/auth/login', request.url));
 }

 // Si hay token y está intentando acceder a páginas de auth
 if (token && isAuthPage) {
   return NextResponse.redirect(new URL('/dashboard', request.url));
 }

 return NextResponse.next();
}

// Configurar las rutas que queremos proteger
export const config = {
 matcher: ['/dashboard/:path*', '/auth/:path*']
};