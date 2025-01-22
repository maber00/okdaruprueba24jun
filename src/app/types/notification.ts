// src/app/types/notification.ts
export type NotificationType = 
  | 'new_order'
  | 'status_change'
  | 'ai_update'
  | 'comment'
  | 'system';

export interface NotificationMetadata {
  orderId?: string;
  projectId?: string;
  taskId?: string;
  commentId?: string;
  status?: string;
  priority?: string;
  userId?: string;
  extraData?: Record<string, string | number | boolean>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  read: boolean;
  timestamp: Date;
  metadata?: NotificationMetadata;
}