// src/app/types/project.ts
export type ProjectType = 
  | 'design' 
  | 'video' 
  | 'animation' 
  | 'web_design'
  | 'web_development';

export type ProjectStatus = 
  | 'open'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';


  export interface ProjectAnalysis {
    status: 'ready' | 'pending';
    priority: 'high' | 'medium' | 'low';
    requirements: string[];
    recommendations: string[];
    assignedTo?: string;
  }

export interface Project {
  id: string;
  title: string;
  client: {
    name: string;
    company: string;
    email: string;
  };
  type: ProjectType;
  status: ProjectStatus;
  assignedTo: string[];
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  brief: string;
  aiSuggestions?: string[];
  attachments?: string[];
}

// src/app/types/stats.ts
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    byType: Record<ProjectType, number>;
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
  };
  clients: {
    total: number;
    active: number;
    new: number;
  };
}