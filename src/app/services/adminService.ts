// src/app/services/adminService.ts
import { 
    collection, 
    doc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy,
    limit,
    startAfter
  } from 'firebase/firestore';
  import { db } from '@/app/lib/firebase';
  import type { AdminUser, UserFilters, UserStats } from '@/app/types/admin';
  import type { UserRole } from '@/app/types/auth';
  
  const USERS_PER_PAGE = 10;
  
  class AdminService {
    private usersCollection = collection(db, 'users');
  
    async getUsers(filters: UserFilters, page = 1): Promise<{
      users: AdminUser[];
      total: number;
      hasMore: boolean;
    }> {
      try {
        let queryConstraints = [];
  
        // Aplicar filtros
        if (filters.role) {
          queryConstraints.push(where('role', '==', filters.role));
        }
  
        if (filters.status) {
          queryConstraints.push(where('status', '==', filters.status));
        }
  
        if (filters.sortBy) {
          queryConstraints.push(orderBy(filters.sortBy, filters.sortDirection || 'asc'));
        }
  
        // Paginación
        if (page > 1) {
          const lastDoc = await this.getLastDocument(page - 1);
          if (lastDoc) {
            queryConstraints.push(startAfter(lastDoc));
          }
        }
  
        queryConstraints.push(limit(USERS_PER_PAGE));
  
        const q = query(this.usersCollection, ...queryConstraints);
        const snapshot = await getDocs(q);
        
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminUser[];
  
        // Obtener total de usuarios para el filtro actual
        const totalSnapshot = await getDocs(query(this.usersCollection, ...queryConstraints.slice(0, -2)));
        const total = totalSnapshot.size;
  
        return {
          users,
          total,
          hasMore: users.length === USERS_PER_PAGE
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }
  
    async getUserStats(): Promise<UserStats> {
      try {
        const snapshot = await getDocs(this.usersCollection);
        const users = snapshot.docs.map(doc => doc.data());
  
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
        const stats: UserStats = {
          total: users.length,
          activeUsers: users.filter(user => user.status === 'active').length,
          byRole: {
            admin: 0,
            project_manager: 0,
            designer: 0,
            client: 0
          },
          newUsersThisMonth: users.filter(user => 
            new Date(user.createdAt) >= firstDayOfMonth
          ).length
        };
  
        // Contar usuarios por rol
        users.forEach(user => {
          if (user.role in stats.byRole) {
            stats.byRole[user.role as UserRole]++;
          }
        });
  
        return stats;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
    }
  
    async updateUserRole(userId: string, role: UserRole): Promise<void> {
      try {
        const userRef = doc(this.usersCollection, userId);
        await updateDoc(userRef, {
          role,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
    }
  
    async updateUserStatus(userId: string, status: AdminUser['status']): Promise<void> {
      try {
        const userRef = doc(this.usersCollection, userId);
        await updateDoc(userRef, {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
      }
    }
  
    async deleteUser(userId: string): Promise<void> {
      try {
        await deleteDoc(doc(this.usersCollection, userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    }
  
    private async getLastDocument(page: number) {
      const q = query(
        this.usersCollection, 
        orderBy('createdAt', 'desc'), 
        limit(page * USERS_PER_PAGE)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs[snapshot.docs.length - 1];
    }
  }
  
  export const adminService = new AdminService();