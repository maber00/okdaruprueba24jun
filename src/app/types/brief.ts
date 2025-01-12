// src/app/types/brief.ts
export type ProjectType = 'design' | 'video' | 'animation' | 'web';

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
    sections: {
        title: string;
        items: {
            label: string;
            value: string;
        }[];
    }[];
    summary: string;
    technicalRequirements: string;
    recommendedProfile: string;
    estimatedTime: string;
    references?: {
        url: string;
        fileName: string;
        type: 'image';
        analysis?: string;
    }[];
}