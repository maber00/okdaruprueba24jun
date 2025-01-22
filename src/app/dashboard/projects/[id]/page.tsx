// src/app/dashboard/projects/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService } from '@/app/services/projectService';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import { useToast } from '@/app/shared/hooks/useToast';
import Button from '@/app/shared/components/ui/Button';
import {
  Calendar,
  Users,
  FileText,
  Clock,
  Brain,
  MessageSquare,
  PlusCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import type { Project, ProjectStatus } from '@/app/types/project';
import { ToastAction } from "@/app/shared/components/ui/toast";


// Componentes internos
import { ProjectTimeline } from '../components/ProjectTimeline';
import { ProjectTeam } from '../components/ProjectTeam';
import { ProjectBrief } from '../components/ProjectBrief';
import { ProjectDeliverables } from '../components/ProjectDeliverables';
import { ProjectComments } from '../components/ProjectComments';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';

const STATUS_COLORS = {
  inquiry: 'bg-purple-100 text-purple-800',
  draft: 'bg-gray-100 text-gray-800',
  briefing: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  client_review: 'bg-orange-100 text-orange-800',
  revisions: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
} as const;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'brief' | 'team' | 'deliverables' | 'comments'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        const projectData = await projectService.getProject(id as string);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
            message: 'Error al cargar el proyecto',
            action: (
              <ToastAction
                altText="Reintentar carga de proyecto"
                onClick={loadProject}
              >
                Reintentar
              </ToastAction>
            )
          });
          
          
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, user, toast]);

  const handleStatusUpdate = async (newStatus: ProjectStatus) => {
    if (!project || !user) return;

    try {
      setIsUpdating(true);
      await projectService.updateProjectStatus(
        project.id,
        newStatus,
        user.uid,
        `Estado actualizado a ${newStatus}`
      );

      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        message: 'Estado del proyecto actualizado',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        message: 'Error al actualizar el estado',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Proyecto no encontrado</h3>
          <p className="mt-2 text-sm text-gray-500">
            El proyecto que buscas no existe o no tienes acceso a él.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-800">
              Volver a proyectos
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[project.status]
              }`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Creado el {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab('team')}>
            <Users className="h-4 w-4 mr-2" />
            Equipo
          </Button>
          {user?.role === 'admin' && (
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          )}
          <Button onClick={() => setActiveTab('brief')}>
            <Brain className="h-4 w-4 mr-2" />
            Brief
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {[
            { id: 'overview', label: 'Vista General', icon: FileText },
            { id: 'brief', label: 'Brief', icon: Brain },
            { id: 'team', label: 'Equipo', icon: Users },
            { id: 'deliverables', label: 'Entregables', icon: Calendar },
            { id: 'comments', label: 'Comentarios', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 inline-block mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <ProjectTimeline 
                project={project}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />
              <ProjectDeliverables 
                deliverables={project.deliverables}
                projectId={project.id}
                canEdit={user?.role === 'admin' || user?.role === 'project_manager'}
              />
            </>
          )}

          {activeTab === 'brief' && (
            <ProjectBrief 
              brief={project.brief}
              projectId={project.id}
              canEdit={user?.role === 'admin' || user?.role === 'project_manager'}
            />
          )}

          {activeTab === 'team' && (
            <ProjectTeam 
              team={project.team}
              projectId={project.id}
              canManageTeam={user?.role === 'admin' || user?.role === 'project_manager'}
            />
          )}

          {activeTab === 'deliverables' && (
            <ProjectDeliverables 
              deliverables={project.deliverables}
              projectId={project.id}
              canEdit={user?.role === 'admin' || user?.role === 'project_manager'}
            />
          )}

          {activeTab === 'comments' && (
            <ProjectComments projectId={project.id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis */}
          <AIAnalysisPanel 
            analysis={project.metadata.aiAnalysis}
            projectId={project.id}
          />

          {/* Project Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Información General</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Fecha de Inicio</label>
                  <p>{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Fecha de Entrega</label>
                  <p>{new Date(project.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tipo de Proyecto</label>
                  <p className="capitalize">{project.type.replace('_', ' ')}</p>
                </div>
                {project.metadata.budget && (
                  <div>
                    <label className="text-sm text-gray-500">Presupuesto</label>
                    <p>${project.metadata.budget.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Prioridad</label>
                  <p className="capitalize">{project.metadata.priority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Acciones Rápidas</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Ver Timeline
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Consultar a DARU
                </Button>
                {(user?.role === 'admin' || user?.role === 'project_manager') && (
                  <Button className="w-full justify-start" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Añadir Entregable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}