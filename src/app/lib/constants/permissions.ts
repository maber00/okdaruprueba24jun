// src/app/lib/constants/permissions.ts
import type { UserRole, Permission } from '@/app/types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_order', 'edit_order', 'delete_order', 'view_orders', 'approve_orders',
    'create_user', 'edit_user', 'delete_user', 'view_users', 'manage_users',
    'assign_roles', 'manage_permissions',
    'create_task', 'edit_task', 'delete_task', 'view_tasks', 'assign_tasks',
    'complete_tasks',
    'view_global_calendar', 'view_team_calendar', 'view_personal_calendar',
    'view_project_calendar', 'manage_calendar_events', 'edit_personal_events',
    'create_deliverable', 'edit_deliverable', 'delete_deliverable', 'view_deliverables',
    'approve_deliverable', 'request_changes', 'upload_files', 'download_files',
    'view_deliverable_history', 'manage_deliverable_status',
    'create_comment', 'edit_comment', 'delete_comment', 'view_comments',
    'provide_feedback', 'resolve_feedback',
    'view_analytics', 'view_reports', 'export_reports', 'manage_settings',
    'create_brief', 'edit_brief', 'approve_brief', 'view_brief',
    'create_checklist', 'edit_checklist', 'complete_checklist_items', 'view_checklist'
  ] as Permission[],

  project_manager: [
    'create_order', 'edit_order', 'view_orders', 'approve_orders', 'delete_order',
    'create_task', 'edit_task', 'view_tasks', 'assign_tasks', 'complete_tasks', 'delete_task',
    'view_users', 'manage_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'manage_permissions',
    'view_team_calendar', 'view_project_calendar', 'manage_calendar_events', 'edit_personal_events', 'view_global_calendar',
    'create_deliverable', 'edit_deliverable', 'view_deliverables', 'approve_deliverable', 'upload_files', 'download_files',
    'view_deliverable_history', 'manage_deliverable_status', 'delete_deliverable',
    'create_comment', 'edit_comment', 'view_comments', 'provide_feedback', 'resolve_feedback', 'delete_comment', 'request_changes',
    'view_analytics', 'view_reports', 'export_reports', 'manage_settings'
  ] as Permission[],

  designer: [
    'view_orders', 'edit_order', 'create_order', 'delete_order',
    'view_tasks', 'complete_tasks', 'create_task', 'edit_task', 'assign_tasks', 'delete_task',
    'view_personal_calendar', 'edit_personal_events', 'view_team_calendar', 'view_project_calendar',
    'create_deliverable', 'view_deliverables', 'upload_files', 'download_files', 'view_deliverable_history',
    'approve_deliverable', 'delete_deliverable', 'manage_deliverable_status', 'edit_deliverable',
    'create_comment', 'view_comments', 'provide_feedback', 'edit_comment', 'delete_comment', 'request_changes',
    'resolve_feedback',
    'view_brief', 'approve_brief', 'edit_brief', 'create_brief', 'view_checklist', 'complete_checklist_items',
    'create_checklist', 'edit_checklist',
    'view_analytics', 'view_reports', 'export_reports', 'manage_settings',
    'view_users', 'manage_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'manage_permissions'
  ] as Permission[],

  client: [
    'create_order', 'view_orders', 'edit_order', 'delete_order',
    'view_tasks', 'complete_tasks', 'create_task', 'edit_task', 'assign_tasks', 'delete_task',
    'view_project_calendar', 'view_team_calendar', 'view_personal_calendar', 'edit_personal_events',
    'view_deliverables', 'download_files', 'request_changes', 'create_deliverable', 'upload_files',
    'view_deliverable_history', 'manage_deliverable_status', 'edit_deliverable', 'approve_deliverable', 'delete_deliverable',
    'create_comment', 'view_comments', 'provide_feedback', 'edit_comment', 'delete_comment', 'resolve_feedback',
    'view_brief', 'approve_brief', 'edit_brief', 'create_brief', 'view_checklist', 'complete_checklist_items',
    'create_checklist', 'edit_checklist',
    'view_analytics', 'view_reports', 'export_reports', 'manage_settings',
    'view_users', 'manage_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'manage_permissions'
  ] as Permission[]
} as const;
