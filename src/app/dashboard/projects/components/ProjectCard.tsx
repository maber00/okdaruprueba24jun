// src/app/dashboard/projects/components/ProjectCard.tsx
import { useRouter } from 'next/navigation';
import { Card } from '@/app/shared/components/ui/card';
import Avatar from '@/app/shared/components/ui/Avatar';
import { 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import type { Project } from '@/app/types/project';

interface ProjectCardProps {
  project: Project;
}

const getStatusColor = (status: Project['status']) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    briefing: 'bg-yellow-100 text-yellow-800',
    review: 'bg-purple-100 text-purple-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-blue-100 text-blue-800',
    client_review: 'bg-orange-100 text-orange-800',
    revisions: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status];
};

const getTypeIcon = (type: Project['type']) => {
  const icons = {
    design: '🎨',
    video: '🎥',
    animation: '🎬',
    web_design: '🖥️',
    web_development: '💻'
  };
  return icons[type];
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const daysUntilDue = Math.ceil(
    (new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getTypeIcon(project.type)}</span>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {project.name}
              </h3>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {project.metadata?.priority && (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              project.metadata.priority === 'high' ? 'bg-red-100 text-red-800' :
              project.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {project.metadata.priority.toUpperCase()}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {project.description}
        </p>

        {/* Timeline */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {daysUntilDue > 0 ? (
              `${daysUntilDue} días restantes`
            ) : daysUntilDue === 0 ? (
              'Vence hoy'
            ) : (
              `${Math.abs(daysUntilDue)} días atrasado`
            )}
          </span>
        </div>

        {/* Team & Progress */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                alt={`Team member ${member.id}`}
                size={32}
              />
            ))}
            {project.team.length > 3 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                +{project.team.length - 3}
              </div>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {project.brief.approved ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Card>
  );
}