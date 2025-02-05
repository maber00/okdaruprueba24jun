// src/app/types/notification.ts

export type NotificationType = 
  | 'assignment'     // Asignación de proyecto
  | 'status_change'  // Cambio de estado en proyecto
  | 'deadline'       // Recordatorio de fecha límite
  | 'comment'        // Nuevo comentario
  | 'ai_update'      // Actualización de IA
  | 'system'         // Notificación del sistema
  | 'feedback';      // Retroalimentación de cliente

export interface NotificationMetadata {
  projectId?: string;
  taskId?: string;
  commentId?: string;
  userId?: string;
  status?: string;
  oldStatus?: string;
  newStatus?: string;
  daysRemaining?: number;
  type?: string;
  priority?: string;
  updateType?: string;
  extraData?: Record<string, string | number | boolean>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  metadata?: NotificationMetadata;
  read: boolean;
  timestamp: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  link?: string;          // URL opcional para navegación
  actions?: {            // Acciones opcionales que se pueden realizar
    type: 'button' | 'link';
    label: string;
    action: string;
  }[];
}