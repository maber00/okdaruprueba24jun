// src/app/(dashboard)/components/DashboardStats.tsx
import { Card, CardContent } from '@/app/shared/components/ui/card';
import { 
  BarChart,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import type { DashboardStats } from '@/app/types/project';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
}

const StatCard = ({ title, value, icon, trend }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs mes anterior
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Proyectos Activos"
        value={stats.projects.active}
        icon={<FileText className="w-6 h-6 text-blue-600" />}
        trend={15}
      />
      <StatCard
        title="Proyectos Completados"
        value={stats.projects.completed}
        icon={<Clock className="w-6 h-6 text-green-600" />}
      />
      <StatCard
        title="Clientes Activos"
        value={stats.clients.active}
        icon={<Users className="w-6 h-6 text-purple-600" />}
        trend={5}
      />
      <StatCard
        title="Ingresos Mensuales"
        value={`$${stats.revenue.monthly.toLocaleString()}`}
        icon={<BarChart className="w-6 h-6 text-yellow-600" />}
        trend={stats.revenue.growth}
      />
    </div>
  );
}