// src/app/core/auth/hooks/useAuth.ts
import { useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { auth } from '@/app/lib/firebase';
import type { UserRole } from '@/app/types/auth';
import { authLogger } from '@/app/lib/logger';

// Constantes para rutas
const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
} as const;

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    authLogger.error('useAuth', 'Hook usado fuera de AuthProvider');
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { user, loading, firebaseUser } = context;

  const isAuthenticated: boolean = !!user;

  const login = useCallback(async (email: string, password: string) => {
    authLogger.info('useAuth', 'Iniciando proceso de login', { email });
    try {
      const result = await authService.login(email, password);
      authLogger.info('useAuth', 'Login exitoso', { uid: result.user.uid });
      return result;
    } catch (error) {
      authLogger.error('useAuth', 'Error en login', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    authLogger.info('useAuth', 'Iniciando registro', { email, displayName });
    try {
      const result = await authService.register(email, password, displayName);
      authLogger.info('useAuth', 'Registro exitoso', { uid: result.uid });
      return result;
    } catch (error) {
      authLogger.error('useAuth', 'Error en registro', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    authLogger.info('useAuth', 'Iniciando logout');
    try {
      await auth.signOut();
      authLogger.info('useAuth', 'Logout exitoso');
      window.location.replace(AUTH_ROUTES.LOGIN);
    } catch (error) {
      authLogger.error('useAuth', 'Error en logout', error);
      throw error;
    }
  }, []);

  const hasPermission = useCallback((permission: string | string[]): boolean => {
    if (!user?.permissions) {
      authLogger.info('useAuth', 'Verificación de permiso fallida - No hay permisos');
      return false;
    }

    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.every(p => user.permissions.includes(p));
  }, [user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) {
      authLogger.info('useAuth', 'Verificación de rol fallida - No hay usuario');
      return false;
    }

    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasRole = roleArray.includes(user.role);

    authLogger.info('useAuth', 'Verificación de rol', { 
      requestedRoles: roleArray,
      userRole: user.role,
      result: hasRole,
      userId: user.uid
    });

    return hasRole;
  }, [user]);

  const updateProfile = useCallback(async (data: { displayName?: string; photoURL?: string }) => {
    if (!firebaseUser) {
      const error = new Error('No hay usuario autenticado');
      authLogger.error('useAuth', 'Intento de actualizar perfil sin usuario', error);
      throw error;
    }

    try {
      authLogger.info('useAuth', 'Actualizando perfil', data);
      await authService.updateUserProfile(firebaseUser, data);
      authLogger.info('useAuth', 'Perfil actualizado exitosamente');
    } catch (error) {
      authLogger.error('useAuth', 'Error actualizando perfil', error);
      throw error;
    }
  }, [firebaseUser]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    updateProfile,
  };
}