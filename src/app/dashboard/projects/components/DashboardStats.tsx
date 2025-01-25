// DashboardStats.tsx
import { Card, CardContent } from '@/app/shared/components/ui/card';
import { FileText, Users, Clock, BarChart } from 'lucide-react';
import type { DashboardStats } from '@/app/types/project';

export default function DashboardStats({ stats }: { stats: DashboardStats }) {
  const statCards = [
    {
      title: "Proyectos Activos",
      value: stats.projects.active,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      trend: 15
    },
    {
      title: "Proyectos Completados",
      value: stats.projects.completed,
      icon: <Clock className="w-6 h-6 text-green-600" />
    },
    {
      title: "Clientes Activos",
      value: stats.clients.active,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      trend: 5
    },
    {
      title: "Ingresos Mensuales",
      value: `$${stats.revenue.monthly.toLocaleString()}`,
      icon: <BarChart className="w-6 h-6 text-yellow-600" />,
      trend: stats.revenue.growth
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.trend && (
                  <p className={`text-sm ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}% vs mes anterior
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

