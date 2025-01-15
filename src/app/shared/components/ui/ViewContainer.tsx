// src/app/shared/components/ui/ViewContainer.tsx
import { ReactNode } from 'react';

interface ViewContainerProps {
  children: ReactNode;
  type: 'list' | 'grid';
  className?: string;
}

export const ViewContainer = ({ children, type, className = '' }: ViewContainerProps) => {
  return (
    <div
      className={`
        view-transition
        ${type === 'grid' ? 'view-grid' : 'view-list'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};