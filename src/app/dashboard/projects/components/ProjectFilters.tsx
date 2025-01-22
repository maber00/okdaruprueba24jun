// src/app/dashboard/projects/components/ProjectFilters.tsx
import { useState } from 'react';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import type { ProjectType, ProjectStatus } from '@/app/types/project';

interface ProjectFilters {
  type?: ProjectType;
  status?: ProjectStatus;
  priority?: 'low' | 'medium' | 'high';
  searchTerm?: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
}

export function ProjectFilters({ filters, onFilterChange }: ProjectFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const projectTypes: ProjectType[] = [
    'design',
    'video',
    'animation',
    'web_design',
    'web_development',
  ];

  const projectStatuses: ProjectStatus[] = [
    'draft',
    'briefing',
    'review',
    'approved',
    'in_progress',
    'client_review',
    'revisions',
    'completed',
    'cancelled',
  ];

  const priorities = ['low', 'medium', 'high'] as const;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={filters.searchTerm || ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              searchTerm: e.target.value,
            })
          }
        />
      </div>
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mb-4"
      >
        {isExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
      </Button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Project Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Proyecto
            </label>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      type: filters.type === type ? undefined : type,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.type === type
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Project Statuses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {projectStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      status: filters.status === status ? undefined : status,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.status === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Priorities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <div className="flex gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      priority: filters.priority === priority ? undefined : priority,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.priority === priority
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {priority.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
