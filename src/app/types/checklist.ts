// src/types/checklist.ts
export interface ChecklistItem {
    id: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
    dependsOn?: string[];
    assignedTo?: string;
    dueDate?: Date;
    comments?: string[];
    category?: string;
    tags?: string[];
    milestoneId?: string;
  }
  
  export interface Checklist {
    id: string;
    projectId: string;
    items: ChecklistItem[];
    createdAt: Date;
    updatedAt: Date;
    completionStatus: number;
    nextAction?: string;
  }
  
  export interface ChecklistProgress {
    totalItems: number;
    completedItems: number;
    percentage: number;
    nextPendingItem?: ChecklistItem;
  }
  
  export interface ChecklistFilter {
    status?: ChecklistItem['status'];
    priority?: ChecklistItem['priority'];
    category?: string;
    assignedTo?: string;
    tags?: string[];
  }
  
  export type ChecklistUpdateEvent = {
    checklistId: string;
    itemId: string;
    changes: Partial<ChecklistItem>;
    updatedBy: string;
    timestamp: Date;
  };