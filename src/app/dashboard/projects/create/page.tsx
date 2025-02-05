// src/app/dashboard/projects/create/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import DAROChat from '@/app/core/ai/components/DAROChat';
import BriefPanel from '@/app/core/ai/analysis/components/BriefPanel';
import { projectService } from '@/app/services/projectService';
import type { BriefData } from '@/app/types/brief';
import type { Project, ProjectType } from '@/app/types/project';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBrief, setShowBrief] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);

  const handleBriefComplete = async (data: BriefData) => {
    if (!user) return;
  
    try {
      const projectData: Partial<Project> = {
        name: data.title,
        type: data.projectType as ProjectType,
        description: data.objective,
        clientId: user.uid,
        brief: {
          approved: false,
          content: {
            objectives: [data.objective],
            targetAudience: data.targetAudience,
            requirements: [],
            brandGuidelines: data.brandValues,
            references: [],
            technicalSpecs: {},
            additionalNotes: ''
          },
          updatedAt: new Date().toISOString(),
          version: 1
        },
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
  
      await projectService.createProject(projectData);
  
      setBriefData(data);
      setShowBrief(true);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className={`transition-all duration-300 ${
        showBrief ? 'w-1/2' : 'w-full'
      }`}>
        <DAROChat onBriefComplete={handleBriefComplete} />
      </div>

      {showBrief && briefData && (
        <div className="w-1/2 animate-slide-in">
          <BriefPanel
            data={briefData}
            onEdit={() => {}}
            onConfirm={() => {
              router.push('/dashboard/projects');
            }}
          />
        </div>
      )}
    </div>
  );
}