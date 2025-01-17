// src/app/types/project.ts
export type ProjectStatus = 
  | 'draft'
  | 'briefing'
  | 'review'
  | 'approved'
  | 'in_progress'
  | 'client_review'
  | 'revisions'
  | 'completed'
  | 'cancelled';

export type ProjectType = 
  | 'design'
  | 'video'
  | 'animation'
  | 'web_design'
  | 'web_development';

export interface ProjectMember {
  id: string;
  userId: string;
  role: 'project_manager' | 'designer' | 'client';
  joinedAt: string;
  permissions: string[];
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  status: ProjectStatus;
  updatedBy: string;
  comment?: string;
  timestamp: string;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  attachments: string[];
  feedback?: string[];
}

export interface BriefContent {
  objectives: string[];
  targetAudience: string;
  requirements: string[];
  brandGuidelines: string;
  references: string[];
  technicalSpecs: Record<string, string>;
  additionalNotes?: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  clientId: string;
  managerId?: string;
  brief: {
    approved: boolean;
    content: BriefContent;
    updatedAt: string;
  };
  team: ProjectMember[];
  timeline: ProjectTimeline[];
  deliverables: ProjectDeliverable[];
  startDate: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    budget?: number;
    aiAnalysis?: {
      complexity: 'low' | 'medium' | 'high';
      recommendations: string[];
      lastAnalyzed: string;
    };
  };
}