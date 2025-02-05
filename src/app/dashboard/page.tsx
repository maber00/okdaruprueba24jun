// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService } from '@/app/services/projectService';
import DashboardStats from './components/DashboardStats';
import { Card, CardContent } from '@/app/shared/components/ui/card';
import { useToast } from '@/app/shared/hooks/useToast';
import Button from '@/app/shared/components/ui/Button';
import { 
  Plus, 
  BarChart, 
  Clock, 
  CheckCircle, 
  Users
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor?: string;
}

const StatCard = ({ title, value, icon, bgColor = 'bg-blue-50' }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    inReview: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const loadStats = async () => {
      try {
        const projectStats = await projectService.getProjectStats(user.uid);
        setStats(projectStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {user.displayName || user.email}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Proyectos Totales"
          value={stats.total}
          icon={<BarChart className="h-6 w-6 text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="En Progreso"
          value={stats.active}
          icon={<Clock className="h-6 w-6 text-yellow-500" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Completados"
          value={stats.completed}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="En Revisión"
          value={stats.inReview}
          icon={<Users className="h-6 w-6 text-purple-500" />}
          bgColor="bg-purple-50"
        />
      </div>

      <DashboardStats stats={{
        totalProjects: stats.total,
        activeProjects: stats.active,
        completedProjects: stats.completed,
        projects: {
          total: stats.total,
          active: stats.active,
          completed: stats.completed
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
      }} />
    </div>
  );
}