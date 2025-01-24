// src/app/dashboard/components/ProjectCard.tsx
import { Card } from '@/app/shared/components/ui/card';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import type { Project } from '@/app/types/project';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
}

export function ProjectCard({ project, viewMode, onClick }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']): string => {
    const colors = {
      inquiry: 'bg-purple-100 text-purple-800',
      draft: 'bg-gray-100 text-gray-800',
      briefing: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      client_review: 'bg-orange-100 text-orange-800',
      revisions: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="p-4 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{project.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(project.dueDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{project.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {new Date(project.dueDate).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {project.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white"
              >
                <User className="h-4 w-4 text-gray-500" />
              </div>
            ))}
            {project.team.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                <span className="text-xs text-gray-500">+{project.team.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}