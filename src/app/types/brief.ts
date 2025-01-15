// src/app/types/brief.ts
export type ProjectType = 'design' | 'video' | 'animation' | 'web';

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
  onEdit?: (sectionTitle: string, sectionIndex: number) => void;
  onConfirm?: () => void;
}