// src/app/(dashboard)/components/RecentProjects.tsx
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import type { Project } from '@/app/types/project';

interface RecentProjectsProps {
  projects: Project[];
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <h2 className="text-lg font-semibold">Proyectos Recientes</h2>
      </CardHeader>
      <CardContent className="divide-y">
        {projects.map((project) => (
          <div key={project.id} className="py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(project.status)}
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500">
                    {project.client.company}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Vence: {project.dueDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}