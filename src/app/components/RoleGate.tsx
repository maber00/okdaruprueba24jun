// src/components/RoleGate.tsx
import { ReactNode } from 'react';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import type { UserRole } from '@/app/types/auth';

interface RoleGateProps {
  children: ReactNode;
  role: UserRole | UserRole[];
  fallback?: ReactNode;
}

export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const { hasAccess, loading } = useRoleAccess(role);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}