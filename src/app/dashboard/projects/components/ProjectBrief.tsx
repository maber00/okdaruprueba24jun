'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Edit2, CheckSquare, Brain, Users, FileText, Calendar, AlertCircle, Target } from 'lucide-react';
import type { BriefContent, TechnicalRequirement } from '@/app/types/project';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { useToast } from '@/app/shared/hooks/useToast';
import { projectService } from '@/app/services/projectService';

// Carga dinámica para mejorar rendimiento
const DynamicButton = dynamic(() => import('@/app/shared/components/ui/Button'));

interface ProjectBriefProps {
  brief: {
    content: BriefContent;
    approved: boolean;
    updatedAt: string;
    version: number;
  };
  projectId: string;
  canEdit: boolean;
}

export default function ProjectBrief({ brief, projectId, canEdit }: ProjectBriefProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedBrief, setEditedBrief] = useState<BriefContent>(brief.content);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await projectService.updateProjectBrief(
        projectId,
        editedBrief,
        false // No aprobado automáticamente
      );

      toast({
        message: 'Brief actualizado exitosamente'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating brief:', error);
      toast({
        message: 'Error al actualizar el brief'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'objetivos':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'audiencia':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'requerimientos':
        return <CheckSquare className="h-5 w-5 text-purple-500" />;
      case 'especificaciones':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'plazos':
        return <Calendar className="h-5 w-5 text-red-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const BriefSection = ({ 
    title, 
    content 
  }: { 
    title: string; 
    content: string[] | string | TechnicalRequirement[] 
  }) => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        {renderSectionIcon(title)}
        <h4 className="font-medium">{title}</h4>
      </div>
      {Array.isArray(content) ? (
        <ul className="space-y-2 ml-6 list-disc">
          {content.map((item, index) => (
            <li key={index} className="text-gray-600">
              {isEditing ? (
                <input
                  type="text"
                  value={typeof item === 'string' ? item : item.name}
                  onChange={(e) => {
                    const newContent = [...content];
                    if (typeof item === 'string') {
                      newContent[index] = e.target.value;
                    } else {
                      newContent[index] = {
                        ...item,
                        name: e.target.value
                      };
                    }
                    setEditedBrief(prev => ({
                      ...prev,
                      [title.toLowerCase()]: newContent
                    }));
                  }}
                  className="w-full px-2 py-1 border rounded"
                />
              ) : (
                typeof item === 'string' ? item : item.name
              )}
            </li>
          ))}
        </ul>
      ) : (
        isEditing ? (
          <textarea
            value={content as string}
            onChange={(e) => setEditedBrief(prev => ({
              ...prev,
              [title.toLowerCase()]: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        ) : (
          <p className="text-gray-600">{content}</p>
        )
      )}
    </div>
  );

  const technicalSpecsArray = Object.entries(editedBrief.technicalSpecs)
    .map(([key, value]) => `${key}: ${value}`);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Brief del Proyecto</h3>
          <p className="text-sm text-gray-500">
            Actualizado: {new Date(brief.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {!brief.approved && (
              <DynamicButton variant="outline">
                <CheckSquare className="h-4 w-4 mr-2" />
                Aprobar Brief
              </DynamicButton>
            )}
            <DynamicButton
              variant={isEditing ? 'primary' : 'outline'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              isLoading={isSubmitting}
            >
              {isEditing ? (
                <>Guardar Cambios</>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar Brief
                </>
              )}
            </DynamicButton>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={`p-4 rounded-lg ${brief.approved ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            {brief.approved ? (
              <CheckSquare className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">
                {brief.approved ? 'Brief Aprobado' : 'Pendiente de Aprobación'}
              </p>
              <p className="text-sm text-gray-600">
                {brief.approved 
                  ? 'Este brief ha sido revisado y aprobado'
                  : 'Este brief aún necesita ser revisado y aprobado'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BriefSection title="Objetivos" content={editedBrief.objectives} />
          <BriefSection title="Audiencia" content={editedBrief.targetAudience} />
          <BriefSection title="Requerimientos" content={editedBrief.requirements.map(req => typeof req === 'string' ? req : req.name)} />
          <BriefSection title="Especificaciones" content={technicalSpecsArray} />
          {editedBrief.additionalNotes && <BriefSection title="Notas Adicionales" content={editedBrief.additionalNotes} />}
        </div>
      </CardContent>
    </Card>
  );
}