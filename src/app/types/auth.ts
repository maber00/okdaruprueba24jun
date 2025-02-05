// src/types/auth.ts

// 1. Definición de tipos base
export type UserRole = 'admin' | 'project_manager' | 'designer' | 'client';

export interface TeamMember {
  id: string;
  userId: string;
  role: UserRole;  
  specialties: string[];
  availability: number;
  projects: string[];
  email: string;
  displayName: string;
  status: 'active' | 'inactive';
}

// 2. Definición de grupos de permisos por categoría
export type ProjectPermission =
  | 'view_projects'
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'manage_team';

export type AnalyticsPermission =
  | 'view_analytics'
  | 'view_reports'
  | 'export_reports';

export type UserManagementPermission =
  | 'manage_users'
  | 'view_users'
  | 'create_user'
  | 'edit_user';

export type TaskPermission =
  | 'view_tasks'
  | 'create_task'
  | 'edit_task'
  | 'complete_tasks';

// 3. Unión de todos los tipos de permisos
export type Permission = 
  | 'view_projects'
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'manage_team'
  | ProjectPermission 
  | AnalyticsPermission 
  | UserManagementPermission 
  | TaskPermission;

// 4. Interface para usuario autenticado
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    company?: string;
    position?: string;
    phone?: string;
    lastLogin?: string;
  };
}

// 5. Permisos por defecto (única definición)
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Permisos de proyecto
    'view_projects',
    'create_project',
    'edit_project',
    'delete_project',
    'manage_team',
    // Permisos de analytics
    'view_analytics',
    'view_reports',
    'export_reports',
    // Permisos de usuarios
    'manage_users',
    'view_users',
    'create_user',
    'edit_user',
    // Permisos de tareas
    'view_tasks',
    'create_task',
    'edit_task',
    'complete_tasks'
  ],
  project_manager: [
    'view_projects',
    'edit_project',
    'manage_team',
    'view_analytics',
    'view_reports',
    'view_tasks',
    'create_task',
    'edit_task'
  ],
  designer: [
    'view_projects',
    'edit_project',
    'view_tasks',
    'complete_tasks'
  ],
  client: [
    'view_projects',
    'create_project',
    'view_reports',
    'view_tasks'
  ]
};

// 6. Helper functions
export const hasPermission = (
  userPermissions: Permission[], 
  requiredPermission: Permission
): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasRole = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): boolean => {
  return Array.isArray(requiredRole) 
    ? requiredRole.includes(userRole)
    : userRole === requiredRole;
};