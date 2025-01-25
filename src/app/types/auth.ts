// src/app/types/auth.ts
export type UserRole = 'admin' | 'project_manager' | 'designer' | 'client';

export type Permission =
  // Gestión de Órdenes/Proyectos
  | 'create_order'
  | 'edit_order'
  | 'delete_order'
  | 'view_orders'
  | 'approve_orders'
  

  // Gestión de Usuarios
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'view_users'
  | 'manage_users'
  | 'assign_roles'
  | 'manage_permissions'

  // Gestión de Tareas
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'view_tasks'
  | 'assign_tasks'
  | 'complete_tasks'

  // Calendario
  | 'view_global_calendar'
  | 'view_team_calendar'
  | 'view_personal_calendar'
  | 'view_project_calendar'
  | 'manage_calendar_events'
  | 'edit_personal_events'

  // Entregables
  | 'create_deliverable'
  | 'edit_deliverable'
  | 'delete_deliverable'
  | 'view_deliverables'
  | 'approve_deliverable'
  | 'request_changes'
  | 'upload_files'
  | 'download_files'
  | 'view_deliverable_history'
  | 'manage_deliverable_status'

  // Comentarios y Feedback
  | 'create_comment'
  | 'edit_comment'
  | 'delete_comment'
  | 'view_comments'
  | 'provide_feedback'
  | 'resolve_feedback'

  // Analytics y Reportes
  | 'view_analytics'
  | 'view_reports'
  | 'export_reports'
  | 'manage_settings'

  // Brief y Checklist
  | 'create_brief'
  | 'edit_brief'
  | 'approve_brief'
  | 'view_brief'
  | 'create_checklist'
  | 'edit_checklist'
  | 'complete_checklist_items'
  | 'view_checklist';

  // src/app/types/auth.ts
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
 };
}
  
  
  
   

// src/app/core/auth/constants/permissions.ts
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Gestión de Órdenes/Proyectos
    'create_order', 'edit_order', 'delete_order', 'view_orders', 'approve_orders',
    
    // Gestión de Usuarios
    'create_user', 'edit_user', 'delete_user', 'view_users', 'manage_users',
    'assign_roles', 'manage_permissions',
    
    // Gestión de Tareas
    'create_task', 'edit_task', 'delete_task', 'view_tasks', 'assign_tasks',
    'complete_tasks',
    
    // Calendario
    'view_global_calendar', 'view_team_calendar', 'view_personal_calendar',
    'view_project_calendar', 'manage_calendar_events', 'edit_personal_events',
    
    // Entregables
    'create_deliverable', 'edit_deliverable', 'delete_deliverable', 'view_deliverables',
    'approve_deliverable', 'request_changes', 'upload_files', 'download_files',
    'view_deliverable_history', 'manage_deliverable_status',
    
    // Comentarios y Feedback
    'create_comment', 'edit_comment', 'delete_comment', 'view_comments',
    'provide_feedback', 'resolve_feedback',
    
    // Analytics y Reportes
    'view_analytics', 'view_reports', 'export_reports', 'manage_settings',
    
    // Brief y Checklist
    'create_brief', 'edit_brief', 'approve_brief', 'view_brief',
    'create_checklist', 'edit_checklist', 'complete_checklist_items', 'view_checklist'
  ],

  project_manager: [
    // Gestión de Órdenes/Proyectos
    'create_order', 'edit_order', 'view_orders', 'approve_orders',
    
    // Gestión de Tareas
    'create_task', 'edit_task', 'view_tasks', 'assign_tasks', 'complete_tasks',
    
    // Calendario
    'view_team_calendar', 'view_project_calendar', 'manage_calendar_events',
    'edit_personal_events',
    
    // Entregables
    'create_deliverable', 'edit_deliverable', 'view_deliverables',
    'approve_deliverable', 'upload_files', 'download_files',
    'view_deliverable_history', 'manage_deliverable_status',
    
    // Comentarios y Feedback
    'create_comment', 'edit_comment', 'view_comments',
    'provide_feedback', 'resolve_feedback',
    
    // Analytics y Reportes
    'view_analytics', 'view_reports',
    
    // Brief y Checklist
    'create_brief', 'edit_brief', 'approve_brief', 'view_brief',
    'create_checklist', 'edit_checklist', 'complete_checklist_items', 'view_checklist'
  ],

  designer: [
    // Gestión de Órdenes/Proyectos
    'view_orders', 'edit_order',
    
    // Gestión de Tareas
    'view_tasks', 'complete_tasks',
    
    // Calendario
    'view_personal_calendar', 'edit_personal_events',
    
    // Entregables
    'create_deliverable', 'view_deliverables', 'upload_files', 'download_files',
    'view_deliverable_history',
    
    // Comentarios y Feedback
    'create_comment', 'view_comments', 'provide_feedback',
    
    // Brief y Checklist
    'view_brief', 'view_checklist', 'complete_checklist_items'
  ],

  client: [
    // Gestión de Órdenes/Proyectos
    'create_order', 'view_orders',
    
    // Calendario
    'view_project_calendar',
    
    // Entregables
    'view_deliverables', 'download_files', 'request_changes',
    
    // Comentarios y Feedback
    'create_comment', 'view_comments', 'provide_feedback',
    
    // Brief y Checklist
    'view_brief', 'approve_brief', 'view_checklist'
  ]
} as const;