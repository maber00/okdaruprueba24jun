// src/app/services/teamService.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { TeamMember } from '@/app/types/auth';

class TeamService {
  private usersCollection = collection(db, 'users');

  async getTeamMembers() {
    try {
      // Obtener todos los usuarios
      const snapshot = await getDocs(this.usersCollection);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName,
        role: doc.data().role,
        status: doc.data().status || 'active',
        availability: 100, // Por defecto
        specialties: [], // Por defecto
        projects: [], // Por defecto
        ...doc.data()
      })) as TeamMember[];

    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async getTeamByRole(role: string) {
    try {
      const q = query(this.usersCollection, where('role', '==', role));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName,
        role: doc.data().role,
        status: doc.data().status || 'active',
        availability: 100,
        specialties: [],
        projects: [],
        ...doc.data()
      })) as TeamMember[];

    } catch (error) {
      console.error('Error getting team by role:', error);
      return [];
    }
  }
}

export const teamService = new TeamService();