// src/app/types/estimation.ts
import type { ProjectType } from './project';

export interface ProjectTemplate {
  id: string;
  type: ProjectType;
  defaultSteps: string[];
  requiredRoles: string[];
  defaultMilestones: Milestone[];
  estimatedDuration: number;
  defaultBudget: BudgetEstimate;
}

export interface ResourceEstimates {
  estimatedCost: number;
  estimatedTime: number;
  team?: TeamMemberEstimate[];
  timeline?: TimelineEstimate;
  budget?: BudgetEstimate;
}

export interface TeamMemberEstimate {
  id: string;
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  availability: number;
  skills?: string[];
  hourlyRate?: number;
}

export interface TimelineEstimate {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  criticalPath: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dependencies: string[];
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