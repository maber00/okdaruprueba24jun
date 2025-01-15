//src/app/core/ai/analysis/components/ProjectAnalysisPanel.tsx
import type { ProjectAnalysis } from '@/app/types/project';

interface ProjectAnalysisPanelProps {
  analysis: ProjectAnalysis;
  isVisible: boolean;
}

export default function ProjectAnalysisPanel({ 
  analysis, 
  isVisible 
}: ProjectAnalysisPanelProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Análisis del Proyecto</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-700">Estado del Proyecto</h3>
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <span className={`inline-block px-2 py-1 rounded-full text-sm ${
              analysis.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {analysis.status === 'ready' ? 'Listo para producción' : 'En análisis'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">Prioridad</h3>
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <span className={`inline-block px-2 py-1 rounded-full text-sm ${
              analysis.priority === 'high' ? 'bg-red-100 text-red-800' : 
              analysis.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {analysis.priority === 'high' ? 'Alta' : 
               analysis.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">Requerimientos</h3>
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <ul className="list-disc pl-4 space-y-1">
              {analysis.requirements.map((req: string, index: number) => (
                <li key={index} className="text-gray-700">{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">Recomendaciones</h3>
          <div className="mt-2 p-3 bg-blue-50 rounded-md">
            <ul className="list-disc pl-4 space-y-1">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {analysis.assignedTo && (
          <div>
            <h3 className="font-semibold text-gray-700">Asignado a</h3>
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-gray-700">{analysis.assignedTo}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Proceder con Asignación
          </button>
        </div>
      </div>
    </div>
  );
}