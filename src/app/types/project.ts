// src/app/types/project.ts

export type ISODateString = string;
export type Priority = 'low' | 'medium' | 'high';
export type CompletionStatus = 'pending' | 'in_progress' | 'completed';

export type ProjectStatus =
  | 'inquiry'
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

export type Permission = 
  | 'view_project'
  | 'edit_project'
  | 'approve_deliverables'
  | 'manage_team'
  | 'view_analytics'
  | 'manage_budget';

export type TeamRole = 'project_manager' | 'designer' | 'client';

export type CommonTag = 
  | 'urgent'
  | 'on-hold'
  | 'priority'
  | 'needs_review'
  | 'blocked'
  | 'in_revision';

export interface TechnicalRequirement {
  type: 'software' | 'hardware' | 'skill';
  name: string;
  version?: string;
  required: boolean;
  description?: string;
  alternativeSolutions?: string[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  projectId: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: TeamRole;
  joinedAt: ISODateString;
  permissions: Permission[];
  availability?: number;
  specialties?: string[];
}

export interface BriefContent {
  objectives: string[];
  targetAudience: string;
  requirements: TechnicalRequirement[];
  brandGuidelines: string;
  references: string[];
  technicalSpecs: Record<string, string>;
  additionalNotes?: string;
  marketResearch?: string;
  competitorAnalysis?: string[];
  budget?: {
    amount: number;
    currency: string;
    breakdown?: Record<string, number>;
  };
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  status: ProjectStatus;
  updatedBy: string;
  comment?: string;
  timestamp: ISODateString;
  duration?: number;
  milestone?: boolean;
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
  version: number;
  reviewers?: string[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  revisionHistory?: {
    version: number;
    date: ISODateString;
    changes: string;
  }[];
}

export interface AIAnalysis {
  status: CompletionStatus;
  complexity: Priority;
  estimatedTime: string;
  estimatedCost?: number;
  confidence: number;
  recommendations: string[];
  risks: string[];
  lastAnalyzed: string;
  suggestedTeam?: {
    roles: TeamRole[];
    size: number;
    requiredSkills: string[];
  };
  technicalRequirements?: TechnicalRequirement[];
  resourceRequirements?: {
    tools: string[];
    skills: string[];
    software: string[];
    estimatedHours: number;
  };
  marketAnalysis?: {
    competitorInsights: string[];
    trendAnalysis: string[];
    opportunityAreas: string[];
  };
}

export interface ProjectMetadata {
  priority: Priority;
  tags: CommonTag[];
  customTags?: string[];
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  aiAnalysis?: AIAnalysis;
  complexity?: Priority;
  progress: number;
  healthStatus: 'on-track' | 'at-risk' | 'delayed';
  nextMilestone?: {
    date: ISODateString;
    description: string;
  };
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
    updatedAt: ISODateString;
    version: number;
  };
  team: ProjectMember[];
  timeline: ProjectTimeline[];
  deliverables: ProjectDeliverable[];
  comments?: Comment[];
  startDate: ISODateString;
  dueDate: ISODateString;
  completedAt?: ISODateString;
  createdAt: Date;
  updatedAt: Date;
  metadata: ProjectMetadata;
  analytics?: {
    timeTracking: {
      estimated: number;
      actual: number;
      unit: 'hours' | 'days';
    };
    revisionCount: number;
    lastActivityDate: ISODateString;
    stakeholderSatisfaction?: number;
  };
}