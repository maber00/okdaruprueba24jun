// src/app/shared/hooks/useViewPreference.ts
import { useState, useEffect } from 'react';

type ViewType = 'list' | 'grid';

export const useViewPreference = (defaultView: ViewType = 'list') => {
  // Inicializar estado desde localStorage si existe
  const [viewType, setViewType] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('orderViewPreference');
      return (savedView as ViewType) || defaultView;
    }
    return defaultView;
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderViewPreference', viewType);
    }
  }, [viewType]);

  return [viewType, setViewType] as const;
};