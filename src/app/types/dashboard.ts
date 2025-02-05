// src/app/types/dashboard.ts
export interface DashboardStatsType {
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
   
   