// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/app/middleware/rateLimiter';
import { authLogger } from '@/app/lib/logger';

// Definimos las rutas públicas y administrativas
const PUBLIC_ROUTES = ['/auth', '/_next', '/api/public', '/'];
const ADMIN_ROUTES = ['/api/admin', '/dashboard/admin', 
   '/dashboard/admin/team',  '/dashboard/admin/users'];

// Función para validar el token mediante el endpoint
const validateToken = async (authToken: string, requestUrl: string) => {
  const response = await fetch(`${requestUrl}/api/auth/validate-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: authToken }),
  });

  if (!response.ok) {
    throw new Error('Invalid token');
  }

  return await response.json();
};

export async function middleware(request: NextRequest) {
  try {
    // 1. Aplicar rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    // 2. Permitir rutas públicas sin autenticación
    if (PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // 3. Leer token desde cookies
    const authToken = request.cookies.get('firebase-token')?.value;
    if (!authToken) {
      authLogger.warn('middleware', 'No auth token found');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // 4. Validar el token y obtener información del usuario
      const { uid, role, permissions } = await validateToken(authToken, request.nextUrl.origin);

      // 5. Verificar permisos para rutas admin
      if (ADMIN_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
        if (role !== 'admin') {
          authLogger.warn('middleware', 'Unauthorized access to admin route', { uid, role });
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // 6. Verificar permisos específicos según la ruta
      const requiredPermissions = getRequiredPermissions(request.nextUrl.pathname);
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(
          permission => permissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          authLogger.warn('middleware', 'Missing required permissions', {
            uid,
            role,
            requiredPermissions
          });
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // 7. Añadir información de usuario al request
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', uid);
      requestHeaders.set('x-user-role', role);
      requestHeaders.set('x-user-permissions', permissions.join(','));

      return NextResponse.next({
        request: { headers: requestHeaders },
      });

    } catch (verifyError) {
      authLogger.error('middleware', 'Token validation failed', verifyError);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    authLogger.error('middleware', 'Unexpected error in middleware', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Helper function to determine required permissions based on route
function getRequiredPermissions(pathname: string): string[] {
  // Mapping de rutas a permisos requeridos
  const routePermissions: Record<string, string[]> = {
    '/dashboard/projects': ['view_projects'],
    '/dashboard/projects/create': ['create_project'],
    '/dashboard/projects/edit': ['edit_project'],
    '/dashboard/users': ['view_users'],
    '/dashboard/analytics': ['view_analytics'],
  };

  // Encuentra la ruta que coincide con el pathname
  const matchingRoute = Object.keys(routePermissions).find(
    route => pathname.startsWith(route)
  );

  return matchingRoute ? routePermissions[matchingRoute] : [];
}

// Configuración del middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};