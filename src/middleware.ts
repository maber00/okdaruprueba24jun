// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirigir `/login` a `/auth/login`
  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirigir `/register` a `/auth/register`
  if (pathname === '/register') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/register';
    return NextResponse.redirect(url);
  }

  // Continuar con el resto de las rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/(dashboard)/:path*'  // Proteger todas las rutas del dashboard
  ]
};