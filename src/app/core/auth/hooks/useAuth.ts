// src/app/core/auth/hooks/useAuth.ts
import { useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { auth } from '@/app/lib/firebase';
import type { UserRole, Permission } from '@/app/types/auth';
import { authLogger } from '@/app/lib/logger';

// Constantes para rutas
const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  REGISTER: '/auth/register'
} as const;

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    authLogger.error('useAuth', 'Hook usado fuera de AuthProvider');
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { user, loading, firebaseUser } = context;

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
    authLogger.info('useAuth', 'Iniciando registro de usuario', { email, displayName });
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
    authLogger.info('useAuth', 'Iniciando proceso de logout');
    try {
      // Guardar el UID antes del signOut para logging
      const currentUid = auth.currentUser?.uid;
      
      // 1. Logout en Firebase
      await auth.signOut();
      authLogger.info('useAuth', 'Logout exitoso', { uid: currentUid });
      
      // 2. Limpiar cualquier dato local si es necesario
      // ... limpieza de datos locales si los hay ...
      
      // 3. Redireccionar usando replace para evitar historial
      authLogger.info('useAuth', `Redirigiendo a ${AUTH_ROUTES.LOGIN}`);
      window.location.replace(AUTH_ROUTES.LOGIN);
      
    } catch (error) {
      authLogger.error('useAuth', 'Error en proceso de logout', error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    authLogger.info('useAuth', 'Iniciando reset de password', { email });
    try {
      await authService.resetPassword(email);
      authLogger.info('useAuth', 'Reset de password completado');
    } catch (error) {
      authLogger.error('useAuth', 'Error en reset password', error);
      throw error;
    }
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) {
      authLogger.info('useAuth', 'Verificación de permiso fallida - No hay usuario');
      return false;
    }
    const hasPermission = user.permissions?.includes(permission) || false;
    authLogger.info('useAuth', `Verificación de permiso: ${permission}`, { result: hasPermission });
    return hasPermission;
  }, [user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) {
      authLogger.info('useAuth', 'Verificación de rol fallida - No hay usuario');
      return false;
    }
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasRole = roleArray.includes(user.role);
    authLogger.info('useAuth', 'Verificación de rol', { roles: roleArray, result: hasRole });
    return hasRole;
  }, [user]);

  const updateProfile = useCallback(async (data: { displayName?: string; photoURL?: string }) => {
    if (!firebaseUser) {
      const error = new Error('No hay usuario autenticado');
      authLogger.error('useAuth', 'Intento de actualizar perfil sin usuario autenticado', error);
      throw error;
    }
    
    try {
      authLogger.info('useAuth', 'Iniciando actualización de perfil', data);
      await authService.updateUserProfile(firebaseUser, data);
      authLogger.info('useAuth', 'Perfil actualizado exitosamente');
    } catch (error) {
      authLogger.error('useAuth', 'Error actualizando perfil', error);
      throw error;
    }
  }, [firebaseUser]);

  return {
    // Estado
    user,
    loading,
    isAuthenticated: !!user,
    
    // Métodos de autenticación
    login,
    register,
    logout,
    resetPassword,
    
    // Métodos de autorización
    hasPermission,
    hasRole,
    
    // Métodos de perfil
    updateProfile
  };
}