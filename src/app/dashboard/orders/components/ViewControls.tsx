// src/app/dashboard/orders/components/ViewControls.tsx
'use client';
import { Grid, List, Layers } from 'lucide-react';
import Button from '@/app/shared/components/ui/Button';

interface ViewControlsProps {
  viewType: 'grid' | 'list';
  onViewChange: (type: 'grid' | 'list') => void;
  groupByStatus: boolean;
  onGroupByStatusChange: (value: boolean) => void;
}

export default function ViewControls({
  viewType,
  onViewChange,
  groupByStatus,
  onGroupByStatusChange
}: ViewControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex rounded-lg border bg-white">
        <button
          onClick={() => onViewChange('list')}
          className={`p-2 ${viewType === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={() => onViewChange('grid')}
          className={`p-2 ${viewType === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
        >
          <Grid className="h-5 w-5" />
        </button>
      </div>

      <Button
        variant="outline"
        onClick={() => onGroupByStatusChange(!groupByStatus)}
        className="flex items-center gap-2"
      >
        <Layers className="h-4 w-4" />
        {groupByStatus ? 'Vista Unificada' : 'Agrupar por Estado'}
      </Button>
    </div>
  );
}