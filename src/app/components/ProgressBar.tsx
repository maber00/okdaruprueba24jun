// src/components/ProgressBar.tsx
'use client';
import { useState, useEffect } from 'react';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export function ProgressBar({
  value,
  maxValue = 100,
  color = 'blue',
  showLabel = true,
  size = 'md',
  className = '',
  animate = true
}: ProgressBarProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (animate) {
      // Animación suave del progreso
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setCurrentValue(value);
    }
  }, [value, animate]);

  const percentage = Math.min(Math.max((currentValue / maxValue) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500 ease-out ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentValue}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export default ProgressBar;