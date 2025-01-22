// src/app/dashboard/projects/components/AIAnalysisPanel.tsx
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

// Se elimina la interfaz no utilizada

export function AIAnalysisPanel({ analysis, projectId, onAnalysisUpdate }: AIAnalysisPanelProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoizar las métricas para evitar recálculos innecesarios
  const metrics = useMemo(() => {
    if (!analysis) return [];

    return [
      {
        icon: <Zap className={`h-5 w-5 ${getComplexityColor(analysis.complexity)}`} />,
        label: 'Complejidad',
        value: getComplexityLabel(analysis.complexity),
        color: getComplexityBgColor(analysis.complexity)
      },
      {
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        label: 'Costo Estimado',
        value: analysis.estimatedCost ? `$${analysis.estimatedCost.toLocaleString()}` : 'N/A',
        color: 'bg-blue-50'
      },
      {
        icon: <Clock className="h-5 w-5 text-purple-500" />,
        label: 'Tiempo Estimado',
        value: analysis.estimatedTime,
        color: 'bg-purple-50'
      }
    ];
  }, [analysis]);

  const handleRefreshAnalysis = async () => {
    try {
      setIsRefreshing(true);
      
      const response = await fetch(`/api/projects/${projectId}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el análisis');
      }

      const updatedAnalysis = await response.json();
      // Aquí podrías emitir un evento o llamar a una función prop para actualizar el análisis
      onAnalysisUpdate?.(updatedAnalysis);
      
      toast({
        message: 'Análisis actualizado exitosamente'
      });

      // Aquí podrías actualizar el estado global del proyecto si es necesario
      
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      toast({
        message: 'Error al actualizar el análisis. Por favor, intente nuevamente.'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función auxiliar para obtener el color basado en la complejidad
  const getComplexityColor = (complexity: AIAnalysis['complexity']) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500'
    };
    return colors[complexity] || colors.medium;
  };

  // Función auxiliar para obtener el color de fondo basado en la complejidad
  const getComplexityBgColor = (complexity: AIAnalysis['complexity']) => {
    const colors = {
      high: 'bg-red-50',
      medium: 'bg-yellow-50',
      low: 'bg-green-50'
    };
    return colors[complexity] || colors.medium;
  };

  // Función auxiliar para obtener la etiqueta de complejidad
  const getComplexityLabel = (complexity: AIAnalysis['complexity']) => {
    const labels = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[complexity] || labels.medium;
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-medium">Análisis de DARU</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No hay análisis disponible para este proyecto</p>
            <Button 
              onClick={handleRefreshAnalysis} 
              isLoading={isRefreshing}
              aria-label="Solicitar nuevo análisis"
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
          aria-label="Actualizar análisis"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 ${metric.color} rounded-lg transition-all duration-200 hover:shadow-sm`}
              role="region"
              aria-label={`Métrica de ${metric.label}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {metric.icon}
                <h4 className="font-medium">{metric.label}</h4>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Recomendaciones */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Recomendaciones</h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-blue-500">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Última actualización */}
        <div className="text-xs text-gray-500 mt-4">
          Último análisis: {new Date(analysis.lastAnalyzed).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}