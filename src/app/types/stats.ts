// src/app/types/stats.ts
export interface DashboardStats {
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