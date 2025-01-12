// src/app/core/auth/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import type { UserRole, Permission } from '@/app/types/auth';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { user, loading, firebaseUser } = context;

  const login = async (email: string, password: string) => {
    try {
      return await authService.login(email, password);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      return await authService.register(email, password, displayName);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Error en reset password:', error);
      throw error;
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!firebaseUser) throw new Error('No hay usuario autenticado');
    try {
      await authService.updateUserProfile(firebaseUser, data);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    resetPassword,
    hasPermission,
    hasRole,
    updateProfile,
    isAuthenticated: !!user,
  };
}