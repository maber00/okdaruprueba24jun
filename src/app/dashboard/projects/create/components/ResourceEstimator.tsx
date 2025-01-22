import { useState } from 'react';
import type { BriefData } from '@/app/types/brief';
import type { AIAnalysis } from '@/app/types/project';
import type { ResourceEstimates } from '@/app/types/estimation';
import { estimationService } from '@/app/services/estimationService';

export interface ResourceEstimatorProps {
  briefData: BriefData;
  aiAnalysis: AIAnalysis;
  onEstimateComplete: (estimates: ResourceEstimates) => void;
}

export function ResourceEstimator({
  briefData,
  aiAnalysis,
  onEstimateComplete
}: ResourceEstimatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateEstimates = async () => {
    try {
      setIsCalculating(true);
      const estimates = await estimationService.estimateResources(briefData, aiAnalysis);
      onEstimateComplete(estimates);
    } catch (error) {
      console.error('Error calculating estimates:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Implementación del UI de estimación */}
    </div>
  );
}