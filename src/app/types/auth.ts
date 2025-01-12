// src/app/types/auth.ts
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
}
export type UserRole = 'admin' | 'project_manager' | 'designer' | 'client';

export type Permission = 
  | 'create_order'
  | 'edit_order'
  | 'delete_order'
  | 'view_orders'
  | 'manage_users'
  | 'approve_orders'
  | 'assign_tasks'
  | 'view_analytics'
  | 'manage_settings';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
}