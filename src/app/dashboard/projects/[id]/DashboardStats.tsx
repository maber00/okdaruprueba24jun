import { Card, CardContent } from '@/app/shared/components/ui/card';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  FileText,
  MessageSquare,
  Target,
  TrendingUp
} from 'lucide-react';
import type { Project } from '@/app/types/project';

interface ProjectStatsProps {
  project: Project;
}

export default function DashboardStats({ project }: ProjectStatsProps) {
  // Progress calculation
  const calculateProgress = () => {
    if (!project.deliverables?.length) return 0;
    const completed = project.deliverables.filter(d => d.status === 'completed').length;
    return Math.round((completed / project.deliverables.length) * 100);
  };

  // Days remaining calculation
  const getDaysRemaining = () => {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Activity calculation
  const getActivityScore = () => {
    const activityPoints = 
      (project.comments?.length || 0) + 
      (project.timeline?.length || 0) + 
      (project.deliverables?.filter(d => d.status !== 'pending').length || 0);
    return Math.min(100, activityPoints * 10);
  };

  const stats = [
    {
      title: "Equipo",
      value: project.team?.length || 0,
      subtext: "Miembros activos",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: null
    },
    {
      title: "Tiempo",
      value: getDaysRemaining(),
      subtext: "Días restantes",
      icon: <Calendar className="w-6 h-6 text-yellow-600" />,
      trend: getDaysRemaining() > 0 ? 'positive' : 'negative'
    },
    {
      title: "Progreso",
      value: calculateProgress(),
      subtext: "% Completado",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      trend: calculateProgress() > 50 ? 'positive' : null
    },
    {
      title: "Entregables",
      value: project.deliverables?.filter(d => d.status === 'completed').length || 0,
      subtext: `de ${project.deliverables?.length || 0} totales`,
      icon: <FileText className="w-6 h-6 text-green-600" />,
      trend: null
    },
    {
      title: "Actividad",
      value: getActivityScore(),
      subtext: "Puntos de actividad",
      icon: <TrendingUp className="w-6 h-6 text-pink-600" />,
      trend: getActivityScore() > 50 ? 'positive' : null
    },
    {
      title: "Comentarios",
      value: project.comments?.length || 0,
      subtext: "Total comentarios",
      icon: <MessageSquare className="w-6 h-6 text-orange-600" />,
      trend: null
    },
    {
      title: "Hitos",
      value: project.timeline?.filter(t => t.milestone)?.length || 0,
      subtext: "Completados",
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
      trend: null
    },
    {
      title: "Tiempo Total",
      value: Math.ceil((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)),
      subtext: "Días transcurridos",
      icon: <Clock className="w-6 h-6 text-cyan-600" />,
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">
                    {typeof stat.value === 'number' && stat.title === "Progreso" 
                      ? `${stat.value}%` 
                      : stat.value}
                  </p>
                  {stat.trend && (
                    <span className={`ml-2 text-sm ${
                      stat.trend === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.trend === 'positive' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                {stat.subtext && (
                  <p className="text-sm text-gray-500">{stat.subtext}</p>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                {stat.icon}
              </div>
            </div>

            {stat.title === "Progreso" && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}