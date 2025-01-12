// src/app/features/dashboard/page.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';  // Actualizar esta línea
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw, 
  PlusCircle
} from 'lucide-react';
import Avatar from '@/app/shared/components/ui/Avatar';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

interface RecentProject {
  id: string;
  title: string;
  client: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  type: string;
}

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'comment' | 'update' | 'create' | 'complete';
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [stats] = useState<DashboardStats>({
    totalProjects: 25,
    activeProjects: 10,
    completedProjects: 15
  });

  const [recentProjects] = useState<RecentProject[]>([
    {
      id: '1',
      title: 'Diseño volantes QR',
      client: 'Marcela Baquero Studio',
      status: 'in_progress',
      dueDate: '2024-12-01',
      type: 'design'
    },
    {
      id: '2',
      title: 'Desarrollo sitio web',
      client: 'Convergence IO',
      status: 'completed',
      dueDate: '2024-11-30',
      type: 'web_development'
    },
    {
      id: '3',
      title: 'Video publicitario',
      client: 'Rockstars LATAM',
      status: 'pending',
      dueDate: '2024-12-15',
      type: 'video'
    }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      user: {
        name: 'Olivia López',
       
      },
      action: 'comentó en',
      target: 'Diseño volantes QR',
      timestamp: '2024-11-25T14:30:00',
      type: 'comment'
    },
    {
      id: '2',
      user: {
        name: 'Jeff Martinez',
       
      },
      action: 'actualizó',
      target: 'Video publicitario',
      timestamp: '2024-11-25T13:15:00',
      type: 'update'
    },
    {
      id: '3',
      user: {
        name: 'Samuel Santa',
       
      },
      action: 'completó',
      target: 'Desarrollo sitio web',
      timestamp: '2024-11-25T12:00:00',
      type: 'complete'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'in_progress':
        return <Clock className="h-5 w-5" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'update':
        return <RefreshCw className="h-5 w-5 text-yellow-500" />;
      case 'create':
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-gray-500">
          Bienvenido, {user?.displayName || user?.email}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Proyectos</h3>
          <p className="text-3xl font-bold">{stats.totalProjects}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Proyectos Activos</h3>
          <p className="text-3xl font-bold">{stats.activeProjects}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Proyectos Completados</h3>
          <p className="text-3xl font-bold">{stats.completedProjects}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Proyectos Recientes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.client}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Vence: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Avatar 
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      size={32}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <div className="ml-2">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{activity.user.name}</span>{' '}
                          {activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}