// src/app/components/ui/TimeRemaining.tsx
'use client';
import { useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeRemainingProps {
  dueDate: Date;
  className?: string;
}

export default function TimeRemaining({ dueDate, className = '' }: TimeRemainingProps) {
  const { timeRemaining, status } = useMemo(() => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    // Determinar el estado basado en los días restantes
    let status: 'danger' | 'warning' | 'normal' = 'normal';
    if (days < 0) {
      status = 'danger';
    } else if (days <= 2) {
      status = 'warning';
    }

    // Formatear el tiempo restante
    let timeRemaining = '';
    if (days < 0) {
      timeRemaining = `${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'} atrasado`;
    } else if (days === 0) {
      timeRemaining = 'Vence hoy';
    } else {
      timeRemaining = `${days} ${days === 1 ? 'día' : 'días'} restantes`;
    }

    return { timeRemaining, status };
  }, [dueDate]);

  const getStatusStyles = () => {
    switch (status) {
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-2 py-1 rounded-md border ${getStatusStyles()} ${className}`}>
      {status === 'danger' ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">{timeRemaining}</span>
    </div>
  );
}