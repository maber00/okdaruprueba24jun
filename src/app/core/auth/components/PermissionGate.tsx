// src/app/core/auth/components/PermissionGate.tsx
'use client';
import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Permission } from '@/app/types/auth';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}