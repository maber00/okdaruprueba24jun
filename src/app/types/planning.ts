// src/types/planning.ts
export interface TimelineEstimate {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
    criticalPath: string[];
  }
  
  export interface ProjectTimeline {
    id: string;
    projectId: string;
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
    status: 'pending' | 'active' | 'completed' | 'paused';
    progress: number;
    lastUpdated: Date;
    assignedTeam?: string[];
    checklistItems?: string[];
  }
  
  export interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    dependencies: string[];
    deliverables?: string[];
    status?: 'pending' | 'in_progress' | 'completed';
    assignedTo?: string[];
    progress?: number;
    type?: 'start' | 'end' | 'review' | 'delivery';
  }
  
  export interface BudgetEstimate {
    total: number;
    breakdown: {
      category: string;
      amount: number;
      description: string;
    }[];
    currency: string;
  }
  
  export interface ResourceEstimate {
    teamSize: number;
    roles: string[];
    toolsRequired: string[];
    estimatedHours: number;
    costPerHour: number;
  }