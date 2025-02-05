// src/app/dashboard/projects/components/ProjectList.tsx
'use client';
import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/app/types/project';

interface ProjectListProps {
  projects: Project[];
  viewType: 'grid' | 'list';
  onProjectClick?: (projectId: string) => void;
}

export function ProjectList({ projects, viewType, onProjectClick }: ProjectListProps) {
  return (
    <div className={`
      grid gap-6
      ${viewType === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
      }
    `}>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          viewMode={viewType}
          onClick={() => onProjectClick?.(project.id)}
        />
      ))}

      {projects.length === 0 && (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay proyectos para mostrar</p>
        </div>
      )}
    </div>
  );
}