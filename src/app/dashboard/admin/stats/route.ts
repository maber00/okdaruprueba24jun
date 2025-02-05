// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyAdminMiddlewares } from '@/app/api/admin/routes/config';
import { adminService } from '@/app/services/adminService';
import { authLogger } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const middlewareResult = await applyAdminMiddlewares(request, 'stats');
    if (middlewareResult) return middlewareResult;

    authLogger.info('admin-stats', 'Obteniendo estadísticas de usuario');
    const stats = await adminService.getUserStats();

    const projectStats = {
      total: stats.total,
      activeUsers: stats.activeUsers,
      byRole: stats.byRole,
      newUsersThisMonth: stats.newUsersThisMonth
    };

    authLogger.info('admin-stats', 'Estadísticas obtenidas exitosamente', projectStats);

    return NextResponse.json({
      success: true,
      data: projectStats
    });

  } catch (error) {
    authLogger.error('admin-stats', 'Error al obtener estadísticas', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const middlewareResult = await applyAdminMiddlewares(request, 'stats');
    if (middlewareResult) return middlewareResult;

    const { type, dateRange } = await request.json();

    authLogger.info('admin-stats', 'Generando reporte', { type, dateRange });
    const report = await adminService.generateReport(type, dateRange);

    authLogger.info('admin-stats', 'Reporte generado exitosamente');

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    authLogger.error('admin-stats', 'Error al generar reporte', error);
    return NextResponse.json(
      { error: 'Error al generar reporte' },
      { status: 500 }
    );
  }
}