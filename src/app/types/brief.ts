// src/app/types/brief.ts

// Tipos base
export type ProjectType = 'design' | 'video' | 'animation' | 'web';

export type ProjectComplexity = 'low' | 'medium' | 'high';

export interface AIAnalysis {
  status: 'pending' | 'in_progress' | 'completed';
  complexity: ProjectComplexity;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  estimatedCost?: number;
  lastAnalyzed: string;
}

export interface TeamMember {
  id: string;
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  availability: number;
  skills?: string[];
  hourlyRate?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dependencies: string[];
  status?: 'pending' | 'in_progress' | 'completed';
}

// Interfaces de Brief
export interface BriefContent {
  objectives: string[];
  targetAudience: string;
  requirements: string[];
  brandGuidelines: string;
  references: string[];
  technicalSpecs: Record<string, string>;
  additionalNotes?: string;
}

export interface BriefSection {
  title: string;
  items: BriefItem[];
}

export interface BriefItem {
  label: string;
  value: string;
}

export interface BriefReference {
  url: string;
  fileName: string;
  type: 'image' | 'video' | 'document';
  analysis?: string;
}

export interface BriefData {
  projectType: ProjectType;
  title: string;
  objective: string;
  targetAudience: string;
  tone: string;
  brandValues: string;
  concept: string;
  keyMessage: string;
  callToAction: string;
  platforms: string;
  sections: BriefSection[];
  summary: string;
  technicalRequirements: string;
  recommendedProfile: string;
  estimatedTime: string;
  references?: BriefReference[];
}

export interface BriefPanelProps {
  data: BriefData;
  onEdit?: (section: string, index: number) => void;
  onConfirm?: () => void;
}


// Interfaces de Estimación
export interface TimelineEstimate {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  criticalPath: string[];
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

// Interfaz para el flujo de creación de proyecto
export interface ProjectCreationFlow {
  currentStep: 'briefing' | 'analysis' | 'team' | 'confirmation';
  briefData: BriefData;
  aiAnalysis?: AIAnalysis;
  estimatedResources?: {
    team: TeamMember[];
    timeline: TimelineEstimate;
    budget: BudgetEstimate;
  };
}

