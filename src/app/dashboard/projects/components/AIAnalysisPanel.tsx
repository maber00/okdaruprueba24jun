// src/app/dashboard/projects/components/AIAnalysisPanel.tsx
'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { useToast } from '@/app/shared/hooks/useToast';
import { Brain, RefreshCw, Zap, Clock, TrendingUp } from 'lucide-react';
import type { AIAnalysis } from '@/app/types/project';

interface AIAnalysisPanelProps {
  analysis?: AIAnalysis;
  projectId: string;
  onAnalysisUpdate?: (analysis: AIAnalysis) => void;
}

export default function AIAnalysisPanel({ 
  analysis, 
  projectId, 
  onAnalysisUpdate 
}: AIAnalysisPanelProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = useMemo(() => {
    if (!analysis) return [];

    return [
      {
        icon: <Zap className={`h-5 w-5 ${getComplexityColor(analysis.complexity)}`} />,
        label: 'Complejidad',
        value: getComplexityLabel(analysis.complexity),
        description: 'Nivel de complejidad basado en requisitos',
        color: getComplexityBgColor(analysis.complexity)
      },
      {
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        label: 'Recursos Requeridos',
        value: analysis.resourceRequirements ? `${analysis.resourceRequirements.estimatedHours}h` : 'N/A',
        description: 'Estimación de horas y recursos necesarios',
        color: 'bg-blue-50'
      },
      {
        icon: <Clock className="h-5 w-5 text-purple-500" />,
        label: 'Tiempo Estimado',
        value: analysis.estimatedTime,
        description: 'Tiempo total estimado para el proyecto',
        color: 'bg-purple-50'
      }
    ];
  }, [analysis]);

  const handleRefreshAnalysis = async () => {
    try {
      setIsRefreshing(true);
      
      const response = await fetch(`/api/projects/${projectId}/analysis`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el análisis');
      }

      const updatedAnalysis = await response.json();
      onAnalysisUpdate?.(updatedAnalysis);
      toast({ message: 'Análisis actualizado exitosamente' });

    } catch (error) {
      console.error('Error refreshing analysis:', error);
      toast({ message: 'Error al actualizar el análisis' });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-medium">Análisis de DARU</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No hay análisis disponible</p>
            <Button 
              onClick={handleRefreshAnalysis}
              isLoading={isRefreshing}
            >
              Solicitar Análisis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-medium">Análisis de DARU</h3>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshAnalysis}
          isLoading={isRefreshing}
          className="h-8 px-3 text-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 ${metric.color} rounded-lg transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                {metric.icon}
                <h4 className="font-medium">{metric.label}</h4>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
            </div>
          ))}
        </div>

        {/* Recomendaciones */}
        {analysis.recommendations?.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recomendaciones</h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-600 flex-shrink-0 text-sm items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Riesgos */}
        {analysis.risks?.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Riesgos Potenciales</h4>
            <ul className="space-y-2">
              {analysis.risks.map((risk, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-100 text-red-600 flex-shrink-0 text-sm  items-center justify-center">
                    !
                  </span>
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Último análisis */}
        <div className="text-xs text-gray-500 mt-4">
          Último análisis: {analysis.lastAnalyzed ? new Date(analysis.lastAnalyzed).toLocaleString() : 'N/A'}
        </div>
      </CardContent>
    </Card>
  );
}

// Funciones auxiliares
function getComplexityColor(complexity: AIAnalysis['complexity']) {
  const colors = { 
    high: 'text-red-500', 
    medium: 'text-yellow-500', 
    low: 'text-green-500' 
  };
  return colors[complexity] || colors.medium;
}

function getComplexityBgColor(complexity: AIAnalysis['complexity']) {
  const colors = { 
    high: 'bg-red-50', 
    medium: 'bg-yellow-50', 
    low: 'bg-green-50' 
  };
  return colors[complexity] || colors.medium;
}

function getComplexityLabel(complexity: AIAnalysis['complexity']) {
  const labels = { 
    high: 'Alta', 
    medium: 'Media', 
    low: 'Baja' 
  };
  return labels[complexity] || labels.medium;
}
