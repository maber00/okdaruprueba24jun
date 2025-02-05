import { memo, type ReactNode } from 'react';
import { isEqual } from 'lodash';

interface MemoizedProps {
  children: ReactNode;
  dependencies?: unknown[];
}

function arePropsEqual(prevProps: MemoizedProps, nextProps: MemoizedProps) {
  if (!prevProps.dependencies && !nextProps.dependencies) {
    return true;
  }

  if (!prevProps.dependencies || !nextProps.dependencies) {
    return false;
  }

  return isEqual(prevProps.dependencies, nextProps.dependencies);
}

export const MemoizedComponent = memo(
  ({ children }: MemoizedProps) => {
    return <>{children}</>;
  },
  arePropsEqual
);

// ✅ Agregar displayName para corregir el error de ESLint
MemoizedComponent.displayName = "MemoizedComponent";
