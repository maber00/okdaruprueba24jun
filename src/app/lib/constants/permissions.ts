//src/app/core/auth/constants/permissions.ts
import type { UserRole, Permission } from '@/app/types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_order',
    'edit_order',
    'delete_order',
    'view_orders',
    'manage_users',
    'approve_orders',
    'assign_tasks',
    'view_analytics',
    'manage_settings'
  ],
  project_manager: [
    'create_order',
    'edit_order',
    'view_orders',
    'approve_orders',
    'assign_tasks',
    'view_analytics'
  ],
  designer: [
    'view_orders',
    'edit_order'
  ],
  client: [
    'create_order',
    'view_orders'
  ]
} as const;