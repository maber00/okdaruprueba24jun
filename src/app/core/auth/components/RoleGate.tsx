// src/app/core/auth/components/RoleGate.tsx
'use client';
import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '@/app/types/auth';

interface RoleGateProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ role, children, fallback = null }: RoleGateProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}