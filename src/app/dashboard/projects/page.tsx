// src/app/dashboard/projects/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { Card } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { ProjectCard } from './components/ProjectCard';
import { projectService } from '@/app/services/projectService';
import { Plus, Search, Filter, Grid as GridIcon, List, Calendar } from 'lucide-react';
import type { Project } from '@/app/types/project';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const loadProjects = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const userProjects = await projectService.getUserProjects(user.uid);
                setProjects(userProjects);
            } catch (error) {
                console.error('Error loading projects:', error);
                setError('Error al cargar los proyectos. Por favor, intenta de nuevo.');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            loadProjects();
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Proyectos</h1>
                <Button onClick={() => console.log('Crear proyecto')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="search"
                            placeholder="Buscar proyectos..."
                            className="pl-10 w-full"
                        />
                    </div>
                </div>

                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>

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

            {projects.length === 0 ? (
                <Card className="p-12 text-center">
                    <h3 className="text-lg font-medium text-gray-900">No hay proyectos</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Comienza creando tu primer proyecto.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => console.log('Crear proyecto')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Proyecto
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}