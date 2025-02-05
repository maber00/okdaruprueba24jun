// src/app/services/projectService.ts
import { 
  collection, 
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  query, 
  where,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/app/lib/firebase';
import type { 
  Project, 
  ProjectDeliverable, 
  ProjectStatus,
} from '@/app/types/project';

import { storageService } from '@/app/services/storage/storageService';


class ProjectService {
  private projectsCollection = collection(db, 'projects');

  // Añadimos el método getProjects que faltaba
  async getProjects(userId: string): Promise<Project[]> {
    console.log('🔍 [ProjectService] getProjects called:', { userId });
    
    if (!userId) {
      console.log('⚠️ [ProjectService] No userId provided');
      return [];
    }
  
    try {
      console.log('🚀 [ProjectService] Creating query');
      const q = query(this.projectsCollection, where('clientId', '==', userId));
      
      console.log('📡 [ProjectService] Executing query');
      const querySnapshot = await getDocs(q);
      console.log('✅ [ProjectService] Query complete, docs:', querySnapshot.size);
      
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      console.log('📦 [ProjectService] Projects processed:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ [ProjectService] Query error:', error);
      return [];
    }
  }
  

 async uploadDeliverableFile(projectId: string, deliverableId: string, file: File): Promise<string> {
  const path = `projects/${projectId}/deliverables/${deliverableId}/${file.name}`;
  const fileUrl = await storageService.uploadFile(file, path);
  
  const deliverableRef = doc(this.projectsCollection, projectId);
  await updateDoc(deliverableRef, {
    [`deliverables.${deliverableId}.attachments`]: arrayUnion(fileUrl)
  });

  return fileUrl;
}
  

  
  async addDeliverable(projectId: string, deliverable: ProjectDeliverable) {
    try {
      const deliverableRef = doc(collection(db, 'projects', projectId, 'deliverables'));
      await setDoc(deliverableRef, deliverable);
    } catch (error) {
      console.error(`Error agregando entregable al proyecto ${projectId}:`, error);
    }
  }

  async createProject(data: Partial<Project>): Promise<string> {
    try {
      const timestamp = new Date();
      const docRef = await addDoc(this.projectsCollection, {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return docRef.id;
    } catch (error) {
      console.error('[ProjectService] Error creating project:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const docRef = doc(this.projectsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Project;
    } catch (error) {
      console.error('[ProjectService] Error getting project:', error);
      return null;
    }
  }


  
  async updateProjectStatus(
    projectId: string, 
    status: ProjectStatus,
    userId: string,
    comment?: string
  ): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const timestamp = new Date();
      await updateDoc(projectRef, {
        status,
        updatedAt: timestamp,
        timeline: arrayUnion({
          id: Date.now().toString(),
          status,
          updatedBy: userId,
          comment,
          timestamp: timestamp.toISOString()
        })
      });
    } catch (error) {
      console.error('[ProjectService] Error updating status:', error);
      throw error;
    }
  }

  async getProjectStats(userId: string) {
    try {
      const projects = await this.getProjects(userId);
      
      return {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        projects: {
          total: projects.length,
          active: projects.filter(p => p.status === 'in_progress').length,
          completed: projects.filter(p => p.status === 'completed').length
        },
        clients: {
          total: 0,
          active: 0
        },
        revenue: {
          total: 0,
          monthly: 0,
          growth: 0
        }
      };
    } catch (error) {
      console.error('[ProjectService] Error getting stats:', error);
      throw error;
    }
  }

  

  private getDefaultStats() {
    console.log('[ProjectService] Returning default stats');
    return {
      total: 0,
      active: 0,
      completed: 0,
      inReview: 0
    };
  }

  private calculateStats(projects: Project[]) {
    console.log('[ProjectService] Calculating stats from projects:', { count: projects.length });
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in_progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length
      },
      clients: { total: 0, active: 0 },
      revenue: { total: 0, monthly: 0, growth: 0 }
    };
  }
}


 
export const projectService = new ProjectService();