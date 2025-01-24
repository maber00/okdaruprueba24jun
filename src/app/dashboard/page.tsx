// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService, createTestProject } from '@/app/services/projectService';
import DashboardStats from './components/DashboardStats';
import Button from '@/app/shared/components/ui/Button';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  clients: {
    total: number;
    active: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(() => ({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    projects: { total: 0, active: 0, completed: 0 },
    clients: { total: 0, active: 0 },
    revenue: { total: 0, monthly: 0, growth: 0 },
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTest = async () => {
    if (!user?.uid) return;
    try {
      const projectId = await createTestProject(user.uid);
      console.log('Proyecto creado:', projectId);
      const projects = await projectService.getUserProjects(user.uid);
      // Actualizar stats con los nuevos datos
      if (Array.isArray(projects)) {
        const activeProjects = projects.filter(p => p.status === 'in_progress');
        const completedProjects = projects.filter(p => p.status === 'completed');
        setStats({
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          completedProjects: completedProjects.length,
          projects: {
            total: projects.length,
            active: activeProjects.length,
            completed: completedProjects.length,
          },
          clients: { total: 0, active: 0 },
          revenue: { total: 0, monthly: 0, growth: 0 },
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear proyecto de prueba');
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      router.replace('/auth/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const projects = await projectService.getUserProjects(user.uid);
        if (Array.isArray(projects)) {
          const activeProjects = projects.filter(p => p.status === 'in_progress');
          const completedProjects = projects.filter(p => p.status === 'completed');
          setStats({
            totalProjects: projects.length,
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            projects: {
              total: projects.length,
              active: activeProjects.length,
              completed: completedProjects.length,
            },
            clients: { total: 0, active: 0 },
            revenue: { total: 0, monthly: 0, growth: 0 },
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, loading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleCreateTest}>
          Crear Proyecto Test
        </Button>
      </div>
      <DashboardStats stats={stats} />
    </div>
  );
}