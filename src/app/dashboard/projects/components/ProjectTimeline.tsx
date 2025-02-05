// src/app/dashboard/projects/components/ProjectTimeline.tsx
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { Clock, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import type { Project, ProjectStatus, ISODateString } from '@/app/types/project';

interface TimelineEntry {
  id: string;
  status: ProjectStatus;
  timestamp: ISODateString;
  comment?: string;
}

interface ProjectTimelineProps {
  project: Project | null;
  onStatusUpdate: (newStatus: ProjectStatus) => Promise<void>;
  isUpdating: boolean;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
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

const STATUS_LABELS: Record<ProjectStatus, string> = {
  inquiry: 'Consulta Inicial',
  draft: 'Borrador',
  briefing: 'En Brief',
  review: 'En Revisión',
  approved: 'Aprobado',
  in_progress: 'En Progreso',
  client_review: 'Revisión del Cliente',
  revisions: 'En Revisiones',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  inquiry: ['draft', 'cancelled'],
  draft: ['briefing', 'cancelled'],
  briefing: ['review', 'cancelled'],
  review: ['approved', 'briefing', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['client_review', 'cancelled'],
  client_review: ['revisions', 'completed', 'cancelled'],
  revisions: ['in_progress', 'client_review', 'cancelled'],
  completed: ['revisions'],
  cancelled: ['draft']
};

export default function ProjectTimeline({ project, onStatusUpdate, isUpdating }: ProjectTimelineProps) {
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  // Si el proyecto no está disponible, mostrar un mensaje de carga
  if (!project) {
    return <div className="p-4 text-gray-500">Cargando datos del proyecto...</div>;
  }

  const currentStatus = project.status ?? 'draft'; // Usa 'draft' si status es undefined
  const possibleTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Estado del Proyecto</h3>
          <p className="text-sm text-gray-500">
            Última actualización: {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : "No disponible"}
          </p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowStatusOptions(!showStatusOptions)}
            disabled={isUpdating || possibleTransitions.length === 0}
          >
            Cambiar Estado
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {showStatusOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
              {possibleTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusUpdate(status);
                    setShowStatusOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Estado Actual */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentStatus)}
              <div>
                <p className="font-medium">Estado Actual</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_COLORS[currentStatus]
                }`}>
                  {STATUS_LABELS[currentStatus]}
                </span>
              </div>
            </div>
            {currentStatus === 'cancelled' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {project.timeline && project.timeline.length > 0 ? (
            project.timeline.map((entry: TimelineEntry, index) => (
              <div 
                key={entry.id} 
                className="relative flex gap-4 pb-4"
              >
                {/* Línea conectora */}
                {index !== project.timeline.length - 1 && (
                  <div className="absolute left-[1.3125rem] top-8 bottom-0 w-px bg-gray-200" />
                )}

                {/* Icono */}
                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {getStatusIcon(entry.status)}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {STATUS_LABELS[entry.status]}
                  </p>
                  {entry.comment && (
                    <p className="mt-1 text-sm text-gray-500">{entry.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay eventos en la línea de tiempo aún.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}