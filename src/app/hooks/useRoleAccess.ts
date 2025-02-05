// src/hooks/useRoleAccess.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import type { UserRole } from '@/app/types/auth';

export function useRoleAccess(requiredRole: UserRole | UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, requiredRole, router]);

  return {
    hasAccess: !!user && (Array.isArray(requiredRole) ? 
      requiredRole.includes(user.role) : 
      user.role === requiredRole),
    loading
  };
}