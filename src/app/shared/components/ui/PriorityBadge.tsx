// src/app/components/ui/PriorityBadge.tsx
'use client';
import { Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function PriorityBadge({ 
  priority, 
  showIcon = true, 
  size = 'md',
  className = ''
}: PriorityBadgeProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-100';
    }
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  };

  const getIconColor = () => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${getPriorityColor()} ${className}`}>
      {showIcon && (
        <Flame className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${getIconColor()}`} />
      )}
      <span className="font-medium">
        {getPriorityLabel()}
      </span>
    </div>
  );
}