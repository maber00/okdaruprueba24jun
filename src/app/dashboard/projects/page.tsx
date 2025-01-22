// src/app/dashboard/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { ProjectCard } from './components/ProjectCard';
import { projectService } from '@/app/services/projectService';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { Card } from '@/app/shared/components/ui/card';
import { 
  Plus, 
  Search, 
  Grid as GridIcon, 
  List, 
  Brain 
} from 'lucide-react';
import type { Project, ProjectStatus } from '@/app/types/project';

const statusFilters: { value: ProjectStatus; label: string }[] = [
  { value: 'inquiry', label: 'Consulta' },
  { value: 'draft', label: 'Borrador' },
  { value: 'briefing', label: 'Resumen' },
  { value: 'review', label: 'Revisión' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'client_review', label: 'Revisión del cliente' },
  { value: 'revisions', label: 'Revisiones' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');
  

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userProjects = await projectService.getUserProjects(user.uid);
        setProjects(userProjects);
        setFilteredProjects(userProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  // Filtrado de proyectos
  useEffect(() => {
    let filtered = [...projects];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedStatus, projects]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button onClick={() => router.push('/dashboard/projects/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar proyectos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus | 'all')}
          >
            <option value="all">Todos los estados</option>
            {statusFilters.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Proyectos */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay proyectos</h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza creando un nuevo proyecto con DARU.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/dashboard/projects/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              viewMode={viewMode}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}