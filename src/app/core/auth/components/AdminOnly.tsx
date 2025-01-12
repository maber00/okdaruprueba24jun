// src/app/core/auth/components/AdminOnly.tsx
'use client';
import { ReactNode } from 'react';
import { RoleGate } from './RoleGate';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGate role="admin" fallback={fallback}>
      {children}
    </RoleGate>
  );
}