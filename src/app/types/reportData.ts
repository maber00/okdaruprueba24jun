// src/app/types/reportData.ts

// Tipo para los detalles de un usuario
export type UserDetail = {
    id: string;
    name: string;
    email: string;
    createdAt: string; // Fecha en formato ISO
    status: string; // Estado del usuario, por ejemplo: 'active', 'inactive'
    role: string; // Rol del usuario, por ejemplo: 'admin', 'client', etc.
  };
  
  // Tipo para reportes de actividad de usuarios
  export type UserActivityReport = {
    type: 'user_activity'; // Identificador del tipo de reporte
    totalUsers: number; // Total de usuarios
    activeUsers: number; // Usuarios activos
    newUsersThisMonth: number; // Nuevos usuarios en el mes
    byRole: Record<string, number>; // Conteo de usuarios por rol
    details: UserDetail[]; // Lista de usuarios con detalles
  };
  
  // Tipo para futuros reportes adicionales, por ejemplo, ingresos o métricas generales
  export type GeneralStatsReport = {
    type: 'general_stats';
    totalItems: number;
    stats: Record<string, number>; // Estadísticas generales agrupadas por categoría
  };
  
  // Unión de tipos de reporte
  export type ReportData = UserActivityReport | GeneralStatsReport;
  