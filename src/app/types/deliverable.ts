// src/app/types/deliverable.ts
export interface Deliverable {
    id: string;
    projectId: string;
    name: string;
    description: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected';
    files: DeliverableFile[];
    checklist: ChecklistItem[];
    feedback?: Feedback[];
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface DeliverableFile {
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
    version: number;
    uploadedBy: string;
    uploadedAt: Date;
  }
  
  export interface Feedback {
    id: string;
    content: string;
    userId: string;
    type: 'comment' | 'change_request';
    status: 'pending' | 'in_progress' | 'resolved';
    createdAt: Date;
  }
  
  export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    requiredForDelivery: boolean;
  }