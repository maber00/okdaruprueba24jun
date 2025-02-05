import { useState } from 'react';
import type { ResourceEstimates } from '@/app/types/estimation';

interface ResourceEstimatorProps {
  onEstimateComplete: (estimates: ResourceEstimates) => void;
}

export function ResourceEstimator({
  onEstimateComplete,
}: ResourceEstimatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimates, setEstimates] = useState<ResourceEstimates | null>(null);

  const calculateEstimates = async () => {
    setIsCalculating(true);
    try {
      const placeholderEstimates: ResourceEstimates = {
        estimatedCost: 0,
        estimatedTime: 0,
        team: [],
        timeline: {
          startDate: new Date(),
          endDate: new Date(),
          milestones: [],
          criticalPath: []
        },
        budget: {
          total: 0,
          breakdown: [],
          currency: 'USD'
        }
      };

      setEstimates(placeholderEstimates);
      onEstimateComplete(placeholderEstimates);
    } catch (error) {
      console.error('Error calculando estimaciones:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Estimaciones del Proyecto</h3>
      <p className="text-sm text-gray-500">
        Esta funcionalidad estará disponible próximamente.
      </p>
      <button
        onClick={calculateEstimates}
        disabled={isCalculating}
        className={`px-4 py-2 rounded ${
          isCalculating ? 'bg-gray-400' : 'bg-blue-500 text-white'
        }`}
      >
        {isCalculating ? 'Calculando...' : 'Calcular'}
      </button>

      {estimates && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Resultados:</h4>
          <p>Costo estimado: ${estimates.estimatedCost.toFixed(2)}</p>
          <p>Tiempo estimado: {estimates.estimatedTime} horas</p>
          {estimates.budget && (
            <p>Presupuesto total: ${estimates.budget.total.toFixed(2)} {estimates.budget.currency}</p>
          )}
        </div>
      )}
    </div>
  );
}