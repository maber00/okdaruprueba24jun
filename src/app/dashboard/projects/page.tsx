'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { projectService } from '@/app/services/projectService';
import DashboardStats from './components/DashboardStats';
import RecentProjects from './components/RecentProjects';
import ActivityFeed from './components/ActivityFeed';
import LoadingSpinner from '@/app/shared/components/ui/LoadingSpinner';
import ErrorMessage from '@/app/shared/components/ui/ErrorMessage';
import type { DashboardStats as DashboardStatsType } from '@/app/types/project';

const initialStats: DashboardStatsType = {
 totalProjects: 0,
 activeProjects: 0,
 completedProjects: 0,
 projects: { total: 0, active: 0, completed: 0 },
 clients: { total: 0, active: 0 },
 revenue: { total: 0, monthly: 0, growth: 0 }
};

export default function DashboardPage() {
 const { user, loading } = useAuth();
 const router = useRouter();
 const [stats, setStats] = useState<DashboardStatsType>(initialStats);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const loadDashboardData = useCallback(async () => {
   if (!user?.uid) return;

   try {
     setIsLoading(true);
     const projectStats = await projectService.getProjectStats(user.uid);
     
     setStats({
       totalProjects: projectStats.total,
       activeProjects: projectStats.active,
       completedProjects: projectStats.completed,
       projects: projectStats,
       clients: { total: 0, active: 0 },
       revenue: { total: 0, monthly: 0, growth: 0 }
     });
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Error al cargar datos');
   } finally {
     setIsLoading(false);
   }
 }, [user?.uid]);

 useEffect(() => {
   if (!loading && !user?.uid) {
     router.replace('/auth/login');
     return;
   }
   loadDashboardData();
 }, [loading, user?.uid, router, loadDashboardData]);

 if (isLoading) {
   return <LoadingSpinner />;
 }

 if (error) {
   return <ErrorMessage message={error} />;
 }

 return (
   <div className="space-y-6 p-6">
     <div className="flex justify-between items-center">
       <h1 className="text-2xl font-bold">Dashboard</h1>
       <span className="text-gray-500">
         Bienvenido, {user?.displayName || user?.email}
       </span>
     </div>

     <DashboardStats stats={stats} />

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <RecentProjects className="lg:col-span-2" />
       <ActivityFeed />
     </div>
   </div>
 );
}