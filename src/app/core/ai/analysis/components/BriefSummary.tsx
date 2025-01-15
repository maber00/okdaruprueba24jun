// src/app/core/ai/analysis/components/BriefSummary.tsx
'use client';
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { BriefData } from '@/app/types/brief';

interface BriefSummaryProps {
  brief: BriefData;
  onConfirm: () => void;
  onEdit: (section: string) => void;
}

export default function BriefSummary({ brief, onConfirm, onEdit }: BriefSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold">Resumen del Brief</h2>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Check className="w-5 h-5" />
          Confirmar Brief
        </button>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Tipo de Proyecto</label>
              <p className="text-gray-900">{brief.projectType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Objetivo</label>
              <p className="text-gray-900">{brief.objective}</p>
            </div>
          </div>
        </section>

        {/* Audiencia y Tono */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Audiencia y Comunicación</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Público Objetivo</label>
              <p className="text-gray-900">{brief.targetAudience}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tono de Comunicación</label>
              <p className="text-gray-900">{brief.tone}</p>
            </div>
          </div>
        </section>

        {/* Especificaciones */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Especificaciones</h3>
          {brief.sections.map((section, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{section.title}</h4>
                <button
                  onClick={() => onEdit(section.title)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Editar
                </button>
              </div>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="col-span-2">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Referencias */}
        {brief.references && brief.references.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Referencias</h3>
            <div className="grid grid-cols-2 gap-4">
              {brief.references.map((ref, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">{ref.fileName}</p>
                  {ref.analysis && (
                    <p className="text-sm text-gray-600">{ref.analysis}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Requisitos Técnicos */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Requisitos Técnicos</h3>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700">Especificaciones Técnicas:</p>
                <p className="text-blue-600 mt-1">{brief.technicalRequirements}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}