// src/app/dashboard/projects/create/components/ProjectTypeSelector.tsx
import { type ReactNode } from 'react';
import { type ProjectType } from '@/app/types/project';

export interface ProjectTypeOption {
  type: ProjectType;
  icon: ReactNode;
  description: string;
  examples: string[];
}

interface ProjectTypeSelectorProps {
  onSelect: (type: ProjectType) => void;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    type: 'design',
    icon: '🎨',
    description: 'Diseño gráfico, logos, branding y materiales visuales',
    examples: ['Logos', 'Branding', 'Social Media']
  },
  {
    type: 'video',
    icon: '🎥',
    description: 'Producción y edición de video',
    examples: ['Marketing', 'Redes Sociales', 'Corporativo']
  },
  {
    type: 'animation',
    icon: '🎬',
    description: 'Animaciones 2D y 3D',
    examples: ['Motion Graphics', 'Explicativos', 'Promocionales']
  },
  {
    type: 'web_design',
    icon: '🖥️',
    description: 'Diseño de interfaces web y UX/UI',
    examples: ['Sitios Web', 'Landing Pages', 'Apps']
  }
];

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PROJECT_TYPES.map((option) => (
        <button
          key={option.type}
          onClick={() => onSelect(option.type)}
          className="p-6 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{option.icon}</span>
            <h3 className="font-medium">{option.type}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">{option.description}</p>
          <div className="flex flex-wrap gap-2">
            {option.examples.map((example) => (
              <span
                key={example}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full"
              >
                {example}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}