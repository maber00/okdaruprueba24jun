// src/app/dashboard/projects/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService } from '@/app/services/projectService';
import type { Project, ProjectStatus } from '@/app/types/project';

import ProjectBrief from '../components/ProjectBrief';
import ProjectTimeline from '../components/ProjectTimeline';
import { ProjectTeam } from '../components/ProjectTeam';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import { ProjectDeliverables } from '../components/ProjectDeliverables';
import { ProjectComments } from '../components/ProjectComments';

export default function ProjectDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    if (params?.id && typeof params.id === 'string') {
      const loadProject = async () => {
        try {
          const data = await projectService.getProject(params.id);
          console.log("Datos recibidos del proyecto:", data);

          if (!data) {
            console.error("Proyecto no encontrado");
            setIsLoading(false);
            return;
          }

          setProject(data);
        } catch (error) {
          console.error("Error al obtener el proyecto:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadProject();
    }
  }, [user, authLoading, params?.id]);

  const updateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!project?.id || !user?.uid) return;

    try {
      const updatedProject = await projectService.updateProjectStatus(
        project.id,
        newStatus,
        user.uid
      );
      setProject(updatedProject);
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const updateAnalysis = (newAnalysis: Project['analysis']) => {
    setProject(prev => prev ? { ...prev, analysis: newAnalysis } : prev);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium">Proyecto no encontrado</h3>
        <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-800">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  const canManageTeam = user?.role === 'admin' || user?.uid === project.clientId;
  const canEditDeliverables = canManageTeam;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{project.name}</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">{project.description}</p>
        <div className="mt-4">
          <span className="font-medium">Estado:</span> {project.status}
        </div>
        <div className="mt-2">
          <span className="font-medium">Tipo:</span> {project.type}
        </div>
      </div>

      {/* Brief del Proyecto */}
      <div className="bg-white rounded-lg shadow p-4">
        <ProjectBrief 
          brief={project.brief}
          projectId={project.id}
          canEdit={canManageTeam}
        />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-4">
        <ProjectTimeline 
          project={project}
          onStatusUpdate={updateProjectStatus}
          isUpdating={false}
        />
      </div>

      {/* Equipo */}
      <div className="bg-white rounded-lg shadow p-4">
        <ProjectTeam 
          team={project.team} 
          projectId={project.id}
          canManageTeam={canManageTeam} 
        />
      </div>

      {/* Análisis DARU */}
      <div className="bg-white rounded-lg shadow p-4">
        <AIAnalysisPanel 
          analysis={project.analysis}
          projectId={project.id}
          onAnalysisUpdate={updateAnalysis}
        />
      </div>

      {/* Entregables */}
      <div className="bg-white rounded-lg shadow p-4">
        <ProjectDeliverables 
          deliverables={project.deliverables}
          projectId={project.id}
          canEdit={canEditDeliverables}
        />
      </div>

      {/* Comentarios */}
      {project.id && (
        <div className="bg-white rounded-lg shadow p-4">
          <ProjectComments projectId={project.id} />
        </div>
      )}
    </div>
  );
}