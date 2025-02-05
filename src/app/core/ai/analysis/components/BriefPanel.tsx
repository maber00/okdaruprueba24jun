// src/app/core/ai/analysis/components/BriefPanel.tsx
'use client';
import React from 'react';
import { Edit2, Check, File, Image as ImageIcon, Video } from 'lucide-react';
import { 
  type BriefPanelProps, 
  type BriefReference, 
  type BriefSection,
  type BriefItem 
} from '@/app/types/brief';

export default function BriefPanel({ data, onEdit, onConfirm }: BriefPanelProps) {
  console.log('BriefPanel rendered with data:', data);
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" aria-label="Imagen" />;
      case 'video':
        return <Video className="h-4 w-4" aria-label="Video" />;
      default:
        return <File className="h-4 w-4" aria-label="Archivo" />;
    }
  };

  return (
    <div className="w-full bg-gray-50 border-l border-gray-200 h-screen overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Header con botones de acción */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
            <p className="text-sm text-gray-500">Tipo: {data.projectType}</p>
          </div>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Brief
            </button>
          )}
        </div>

        {/* Secciones del Brief */}
        {data.sections.map((section: BriefSection, sectionIndex: number) => (
          <div key={section.title} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {onEdit && (
                <button
                  onClick={() => onEdit(section.title, sectionIndex)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {section.items.map((item: BriefItem, itemIndex: number) => (
                <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">{item.label}</p>
                  <p className="mt-1 text-gray-600">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Referencias */}
        {data.references && data.references.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Referencias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.references.map((ref: BriefReference, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                  {getFileIcon(ref.type)}
                  <div>
                    <p className="font-medium text-gray-700">{ref.fileName}</p>
                    {ref.analysis && (
                      <p className="mt-1 text-sm text-gray-600">{ref.analysis}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}