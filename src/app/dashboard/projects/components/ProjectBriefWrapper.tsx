// src/app/dashboard/projects/components/ProjectBriefWrapper.ts
'use client';
import dynamic from 'next/dynamic';

const ProjectBrief = dynamic(() => import('./ProjectBrief').then((mod) => mod.default), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
});

export default ProjectBrief;