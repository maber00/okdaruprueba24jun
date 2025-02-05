// src/app/dashboard/projects/page.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService } from '@/app/services/projectService';
import { ProjectList } from '@/app/dashboard/projects/components/ProjectList';
import DashboardStats from '@/app/dashboard/components/DashboardStats';
import Button from '@/app/shared/components/ui/Button';
import { Plus } from 'lucide-react';
import { useToast } from '@/app/shared/hooks/useToast';
import type { Project } from '@/app/types/project';
import type { DashboardStats as DashboardStatsType } from '@/app/types/dashboard';

const DEFAULT_STATS: DashboardStatsType = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  projects: {
    total: 0,
    active: 0,
    completed: 0
  },
  clients: {
    total: 0,
    active: 0
  },
  revenue: {
    total: 0,
    monthly: 0,
    growth: 0
  }
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStatsType>(DEFAULT_STATS);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Referencias para control
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const lastLoadedUserId = useRef<string | null>(null);


  
  // Función estable de carga de datos
  const loadData = useCallback(async (userId: string) => {
    // Evitar cargas duplicadas para el mismo usuario
    if (lastLoadedUserId.current === userId) {
      console.log('🔄 [ProjectsPage] Data already loaded for user:', userId);
      return;
    }

    // Evitar cargas concurrentes
    if (isLoadingRef.current) {
      console.log('⏳ [ProjectsPage] Loading already in progress');
      return;
    }

    try {
      console.log('🚀 [ProjectsPage] Starting data load for:', userId);
      isLoadingRef.current = true;
      setIsLoading(true);

      const projectList = await projectService.getProjects(userId);
      console.log('✅ [ProjectsPage] Projects received:', projectList.length);

      // Verificar si el componente sigue montado antes de actualizar estado
      if (!isMounted.current) return;

      setProjects(projectList);

      const projectStats = await projectService.getProjectStats(userId);
      console.log('✅ [ProjectsPage] Stats received');

      // Verificar de nuevo si el componente sigue montado
      if (!isMounted.current) return;

      setStats(projectStats);
      lastLoadedUserId.current = userId;
    } catch (error) {
      console.error('❌ [ProjectsPage] Load error:', error);
      if (isMounted.current) {
        toast({
          message: 'Error al cargar los datos'
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isLoadingRef.current = false;
      console.log('🏁 [ProjectsPage] Load complete');
    }
  }, [toast]); // toast es estable por ser un hook

  useEffect(() => {
    // Control de montaje/desmontaje
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    console.log('🔄 [ProjectsPage] Auth state changed:', { 
      authLoading, 
      hasUser: !!user 
    });

    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }

    if (user?.uid && !isLoadingRef.current) {
      loadData(user.uid);
    }
  }, [user, authLoading, router, loadData]);

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  }, [router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.displayName || user?.email}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <DashboardStats stats={stats} />

      <div className="flex justify-end space-x-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setViewType('grid')}
          className={viewType === 'grid' ? 'bg-blue-50' : ''}
        >
          Grid
        </Button>
        <Button
          variant="outline"
          onClick={() => setViewType('list')}
          className={viewType === 'list' ? 'bg-blue-50' : ''}
        >
          Lista
        </Button>
      </div>

      <ProjectList
        projects={projects}
        viewType={viewType}
        onProjectClick={handleProjectClick}
      />
    </div>
  );
}
