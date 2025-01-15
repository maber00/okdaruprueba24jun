// src/app/types/admin.ts
import type { UserRole, Permission } from './auth';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: {
    phoneNumber?: string;
    company?: string;
    position?: string;
  };
}

export interface UserFilters {
  role?: UserRole;
  status?: AdminUser['status'];
  searchTerm?: string;
  sortBy?: keyof AdminUser;
  sortDirection?: 'asc' | 'desc';
}

export interface UserStats {
  total: number;
  activeUsers: number;
  byRole: Record<UserRole, number>;
  newUsersThisMonth: number;
}