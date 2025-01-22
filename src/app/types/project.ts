// src/app/types/project.ts

// Tipo para fechas ISO
export type ISODateString = string;

// Tipos base
export type Priority = 'low' | 'medium' | 'high';
export type CompletionStatus = 'pending' | 'in_progress' | 'completed';

// Estados del proyecto
export type ProjectStatus =
  | 'inquiry'      // Consulta inicial
  | 'draft'        // Borrador
  | 'briefing'     // En proceso de brief
  | 'review'       // En revisión
  | 'approved'     // Aprobado
  | 'in_progress'  // En progreso
  | 'client_review' // Revisión del cliente
  | 'revisions'    // En revisiones
  | 'completed'    // Completado
  | 'cancelled';   // Cancelado

// Tipos de proyecto
export type ProjectType =
  | 'design'
  | 'video'
  | 'animation'
  | 'web_design'
  | 'web_development';

// Permisos específicos
export type Permission = 
  | 'view_project'
  | 'edit_project'
  | 'approve_deliverables'
  | 'manage_team'
  | 'view_analytics'
  | 'manage_budget';

// Roles del equipo
export type TeamRole = 'project_manager' | 'designer' | 'client';

// Etiquetas comunes
export type CommonTag = 
  | 'urgent'
  | 'on-hold'
  | 'priority'
  | 'needs_review'
  | 'blocked'
  | 'in_revision';

// Requisitos técnicos
export interface TechnicalRequirement {
  type: 'software' | 'hardware' | 'skill';
  name: string;
  version?: string;
  required: boolean;
  description?: string;
  alternativeSolutions?: string[];
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  clients: {
    total: number;
    active: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
}





// Miembro del equipo del proyecto
export interface ProjectMember {
  id: string;
  userId: string;
  role: TeamRole;
  joinedAt: ISODateString;
  permissions: Permission[];
  availability?: number; // Porcentaje de disponibilidad
  specialties?: string[];
}

// Contenido del Brief
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

// Análisis del Proyecto
export interface ProjectAnalysis {
  status: 'ready' | 'pending';
  priority: Priority;
  requirements: TechnicalRequirement[];
  recommendations: string[];
  assignedTo?: string;
  riskLevel: Priority;
  confidenceScore: number;
  nextReviewDate?: ISODateString;
}

// Línea de tiempo del proyecto
export interface ProjectTimeline {
  id: string;
  projectId: string;
  status: ProjectStatus;
  updatedBy: string;
  comment?: string;
  timestamp: ISODateString;
  duration?: number; // En días
  milestone?: boolean;
}

// Entregables del proyecto
export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  status: CompletionStatus;
  dueDate: ISODateString;
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

// Análisis de IA
export interface AIAnalysis {
  status: CompletionStatus;
  complexity: Priority;
  estimatedTime: string;
  estimatedCost?: number;
  confidence: number;
  recommendations: string[];
  risks: string[];
  lastAnalyzed: ISODateString;
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

// Interfaz principal del Proyecto
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
  startDate: ISODateString;
  dueDate: ISODateString;
  completedAt?: ISODateString;
  createdAt: Date; 
  updatedAt: ISODateString;
  metadata: {
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
    progress: number; // Porcentaje de completitud
    healthStatus: 'on-track' | 'at-risk' | 'delayed';
    nextMilestone?: {
      date: ISODateString;
      description: string;
    };
  };
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