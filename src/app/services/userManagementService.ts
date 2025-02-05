// src/app/services/userManagementService.ts
import { ROLE_PERMISSIONS } from '@/app/lib/constants/permissions';
import type { Permission } from '@/app/types/auth';
import { 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { db, auth } from '@/app/lib/firebase';
import type { UserRole, AuthUser } from '@/app/types/auth';
import { authLogger } from '@/app/lib/logger';

export interface UserFilters {
  role?: UserRole;
  status?: 'active' | 'inactive' | 'pending';
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateUserDTO {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  metadata?: {
    company?: string;
    position?: string;
    phone?: string;
  };
}

class UserManagementService {
  private usersCollection = collection(db, 'users');

  
  async createUser(userData: CreateUserDTO) {

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
  
        await updateProfile(userCredential.user, {
          displayName: userData.displayName
        });
  
        // Inicializar permisos basados en el rol
        const permissions = ROLE_PERMISSIONS[userData.role] || [];
  
        // Crear documento con todos los campos necesarios
        const userDoc = doc(this.usersCollection, userCredential.user.uid);
        await setDoc(userDoc, {
          uid: userCredential.user.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          permissions,
          metadata: {
            ...userData.metadata,
            dateJoined: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
  
        authLogger.info('UserManagementService', 'User created successfully', {
          uid: userCredential.user.uid,
          role: userData.role
        });
  
        return userCredential.user.uid;
      } catch (error) {
        authLogger.error('UserManagementService', 'Error creating user', error);
        throw error;
      }
    }
  
    // Añadir método para actualizar permisos
    async updateUserPermissions(userId: string, permissions: Permission[]) {
      try {
        const userRef = doc(this.usersCollection, userId);
        await updateDoc(userRef, {
          permissions,
          updatedAt: new Date().toISOString()
        });
  
        authLogger.info('UserManagementService', 'User permissions updated', { 
          userId, 
          permissions 
        });
      } catch (error) {
        authLogger.error('UserManagementService', 'Error updating permissions', error);
        throw error;
      }
    }

     
  
    // Actualizar el perfil del usuario
    async updateUserProfile(userId: string, updates: Partial<{
      displayName: string;
      metadata: AuthUser['metadata'];
    }>) {
      try {
        const userRef = doc(this.usersCollection, userId);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
  
        authLogger.info('UserManagementService', 'User profile updated', {
          userId,
          updates
        });
      } catch (error) {
        authLogger.error('UserManagementService', 'Error updating profile', error);
        throw error;
      }
    }

    

    async getUsersByRole(role: UserRole): Promise<AuthUser[]> {
      try {
        const querySnapshot = await getDocs(
          query(this.usersCollection, where('role', '==', role))
        );
        
        return querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as AuthUser));
        
      } catch (error) {
        authLogger.error('UserManagementService', 'Error getting users by role', error);
        throw error;
      }
    }
    
    async getUsers(filters: UserFilters): Promise<AuthUser[]> {
      try {
        let q = query(this.usersCollection);
  
        if (filters.role) {
          q = query(q, where('role', '==', filters.role));
        }
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.searchTerm) {
          q = query(q, where('displayName', '>=', filters.searchTerm));
        }
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        } as AuthUser));
      } catch (error) {
        authLogger.error('UserManagementService', 'Error getting users with filters', error);
        throw error;
      }
    }
    
  
  
    // Método para actualizar último login
    async updateLastLogin(userId: string) {
      try {
        const userRef = doc(this.usersCollection, userId);
        await updateDoc(userRef, {
          'metadata.lastLogin': new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        authLogger.error('UserManagementService', 'Error updating last login', error);
        throw error;
      }
    }
  }
  
  export const userManagementService = new UserManagementService();
