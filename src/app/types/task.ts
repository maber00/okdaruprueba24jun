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
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];  // Añadido
  comments?: Comment[];        // Añadido
  metadata?: {
    estimatedHours?: number;
    actualHours?: number;
    dependencies?: string[];
  }
}