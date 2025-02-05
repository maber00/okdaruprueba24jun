// src/app/dashboard/projects/create/components/BriefForm.tsx
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import type { ProjectType } from '@/app/types/project';

interface FormData {
  projectType: ProjectType | '';
  platforms: string[];
  dimensions: string;
  description: string;
  deadline: string;
  references: File[];
}

interface BriefFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'design', label: 'Diseño Gráfico' },
  { value: 'video', label: 'Video' },
  { value: 'animation', label: 'Animación' },
  { value: 'web_design', label: 'Diseño Web' }
];

const PLATFORMS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'Publicidad Física',
  'Producto Físico'
];

export default function BriefForm({ onSubmit }: BriefFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    platforms: [],
    dimensions: '',
    description: '',
    deadline: '',
    references: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[BriefForm] Submitting form:', formData);
    
    try {
      setIsLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('[BriefForm] Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, ...files]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Nuevo Proyecto</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información Básica</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Proyecto
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                projectType: e.target.value as ProjectType | ''
              }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecciona un tipo...</option>
              {PROJECT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Plataformas
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <label key={platform} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={(e) => {
                      const platforms = e.target.checked
                        ? [...formData.platforms, platform]
                        : formData.platforms.filter(p => p !== platform);
                      setFormData(prev => ({ ...prev, platforms }));
                    }}
                    className="mr-2"
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Medidas/Formatos (opcional)"
            value={formData.dimensions}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              dimensions: e.target.value
            }))}
            placeholder="Ej: 1920x1080px, A4, etc."
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción del Proyecto
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
            />
          </div>

          <Input
            type="date"
            label="Fecha Límite"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              deadline: e.target.value
            }))}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Archivos de Referencia
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Crear Proyecto
        </Button>
      </div>
    </form>
  );
}