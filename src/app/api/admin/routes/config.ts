// src/app/api/admin/routes/config.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminOnly, requirePermissions } from '@/app/middleware/withRoleCheck';
import type { Permission } from '@/app/types/auth';

type MiddlewareFunction = (request: NextRequest) => Promise<NextResponse | null>;

interface AdminRouteConfig {
  middlewares: MiddlewareFunction[];
  permissions: Permission[];
}

// Define los middlewares y permisos para cada ruta administrativa
export const adminRouteConfig: Record<string, AdminRouteConfig> = {
  stats: {
    middlewares: [adminOnly],
    permissions: ['view_analytics', 'view_reports']
  },
  users: {
    middlewares: [adminOnly],
    permissions: ['manage_users', 'view_users']
  }
};

// Helper para aplicar los middlewares
export async function applyAdminMiddlewares(
  request: NextRequest,
  route: keyof typeof adminRouteConfig
): Promise<NextResponse | null> {
  const config = adminRouteConfig[route];
  if (!config) {
    return NextResponse.json(
      { error: 'Ruta administrativa no configurada' },
      { status: 404 }
    );
  }

  // Aplicar middlewares en secuencia
  for (const middleware of config.middlewares) {
    const result = await middleware(request);
    if (result) return result;
  }

  // Verificar permisos
  const permissionMiddleware = requirePermissions(config.permissions);
  const permissionResult = await permissionMiddleware(request);
  if (permissionResult) return permissionResult;

  return null;
}