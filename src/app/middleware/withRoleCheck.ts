// src/middleware/withRoleCheck.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authLogger } from '@/app/lib/logger'
import type { UserRole, Permission } from '@/app/types/auth'

interface RoleCheckConfig {
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
}

export function withRoleCheck(config: RoleCheckConfig) {
  return async function middleware(request: NextRequest) {
    try {
      // 1. Obtener role y permisos del header (establecidos en el middleware principal)
      const userRole = request.headers.get('x-user-role') as UserRole | null
      const userPermissions = request.headers.get('x-user-permissions')?.split(',') as Permission[] | undefined

      // 2. Verificar roles requeridos
      if (config.requiredRoles?.length && userRole) {
        if (!config.requiredRoles.includes(userRole)) {
          authLogger.warn('roleCheck', 'Insufficient role', {
            required: config.requiredRoles,
            provided: userRole
          })
          
          return NextResponse.json(
            { error: 'No tienes los permisos necesarios' },
            { status: 403 }
          )
        }
      }

      // 3. Verificar permisos específicos
      if (config.requiredPermissions?.length && userPermissions) {
        const hasAllPermissions = config.requiredPermissions.every(
          permission => userPermissions.includes(permission)
        )

        if (!hasAllPermissions) {
          authLogger.warn('roleCheck', 'Insufficient permissions', {
            required: config.requiredPermissions,
            provided: userPermissions
          })

          return NextResponse.json(
            { error: 'No tienes los permisos necesarios' },
            { status: 403 }
          )
        }
      }

      return NextResponse.next()

    } catch (error) {
      authLogger.error('roleCheck', 'Error checking roles/permissions', error)
      return NextResponse.json(
        { error: 'Error al verificar permisos' },
        { status: 500 }
      )
    }
  }
}

// Helper para proteger rutas admin
export const adminOnly = withRoleCheck({ 
  requiredRoles: ['admin']
})

// Helper para proteger rutas que requieren permisos específicos
export const requirePermissions = (permissions: Permission[]) => 
  withRoleCheck({ requiredPermissions: permissions })