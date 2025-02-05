// src/app/types/task.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  taskId: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  taskId: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  startTime: Date | string;
  endTime: Date | string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    // ... otros campos del attachment
  }[];
  comments?: {
    content: string;
    createdAt: string;
    // ... otros campos del comentario
  }[];  metadata?: {
    estimatedHours?: number;
    actualHours?: number;
    dependencies?: string[];
  }
}