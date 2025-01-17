// src/app/services/projectService.ts
import { 
    collection, 
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    arrayUnion,
    type QueryConstraint
  } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { authLogger } from '@/app/lib/logger';
import type { 
    Project, 
    ProjectStatus, 
    ProjectMember, 
    ProjectTimeline,
    ProjectDeliverable,
    BriefContent
} from '@/app/types/project';
  
class ProjectService {
    private projectsCollection = collection(db, 'projects');
  
    async createProject(projectData: Omit<Project, 'id'>): Promise<string> {
      try {
        const docRef = await addDoc(this.projectsCollection, {
          ...projectData,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        authLogger.info('ProjectService', 'Project created successfully', { projectId: docRef.id });
        return docRef.id;
      } catch (error) {
        authLogger.error('ProjectService', 'Error creating project:', error);
        throw error;
      }
    }
  
    async getProject(projectId: string): Promise<Project | null> {
      try {
        const docRef = doc(this.projectsCollection, projectId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          authLogger.warn('ProjectService', 'Project not found', { projectId });
          return null;
        }
  
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Project;
      } catch (error) {
        authLogger.error('ProjectService', 'Error getting project:', error);
        throw error;
      }
    }
  
    async getUserProjects(userId: string, role?: ProjectMember['role']): Promise<Project[]> {
      try {
        let constraints: QueryConstraint[] = [];
        
        if (role) {
          // Si se especifica un rol, buscar proyectos donde el usuario tenga ese rol
          constraints = [
            where('team', 'array-contains', {
              userId,
              role,
            }),
            orderBy('createdAt', 'desc')
          ];
        } else {
          // Si no se especifica rol, buscar todos los proyectos del usuario
          constraints = [
            where('team', 'array-contains-any', [{
              userId,
              role: 'admin'
            }, {
              userId,
              role: 'project_manager'
            }, {
              userId,
              role: 'designer'
            }, {
              userId,
              role: 'client'
            }]),
            orderBy('createdAt', 'desc')
          ];
        }
    
        const q = query(this.projectsCollection, ...constraints);
        const snapshot = await getDocs(q);
        
        authLogger.info('ProjectService', 'Projects fetched successfully', {
          userId,
          role,
          count: snapshot.docs.length
        });
    
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
      } catch (error) {
        authLogger.error('ProjectService', 'Error getting user projects:', error);
        throw error;
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
        const timelineEntry: ProjectTimeline = {
          id: Date.now().toString(),
          projectId,
          status,
          updatedBy: userId,
          comment,
          timestamp: new Date().toISOString()
        };
  
        await updateDoc(projectRef, {
          status,
          updatedAt: new Date().toISOString(),
          'timeline': arrayUnion(timelineEntry)
        });
        
        authLogger.info('ProjectService', 'Project status updated', { 
          projectId, 
          status, 
          userId 
        });
      } catch (error) {
        authLogger.error('ProjectService', 'Error updating project status:', error);
        throw error;
      }
    }
  
    async addTeamMember(
      projectId: string, 
      userId: string, 
      role: ProjectMember['role'],
      permissions: string[] = []
    ): Promise<void> {
      try {
        const projectRef = doc(this.projectsCollection, projectId);
        const member: ProjectMember = {
          id: Date.now().toString(),
          userId,
          role,
          permissions,
          joinedAt: new Date().toISOString()
        };
  
        await updateDoc(projectRef, {
          'team': arrayUnion(member),
          updatedAt: new Date().toISOString()
        });

        authLogger.info('ProjectService', 'Team member added', { 
          projectId, 
          userId, 
          role 
        });
      } catch (error) {
        authLogger.error('ProjectService', 'Error adding team member:', error);
        throw error;
      }
    }
    async updateProjectBrief(
        projectId: string,
        briefContent: BriefContent,
        approved: boolean = false
      ): Promise<void> {
        try {
          const projectRef = doc(this.projectsCollection, projectId);
          await updateDoc(projectRef, {
            brief: {
              content: briefContent,
              approved,
              updatedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          });
  
          authLogger.info('ProjectService', 'Brief updated successfully', { 
            projectId,
            approved
          });
        } catch (error) {
          authLogger.error('ProjectService', 'Error updating brief:', error);
          throw error;
        }
      }
  
      // Método para añadir entregables al proyecto
      async addDeliverable(
        projectId: string,
        deliverable: Omit<ProjectDeliverable, 'id'>
      ): Promise<void> {
        try {
          const projectRef = doc(this.projectsCollection, projectId);
          const deliverableWithId = {
            ...deliverable,
            id: Date.now().toString()
          };
    
          await updateDoc(projectRef, {
            'deliverables': arrayUnion(deliverableWithId),
            updatedAt: new Date().toISOString()
          });
  
          authLogger.info('ProjectService', 'Deliverable added successfully', { 
            projectId,
            deliverableId: deliverableWithId.id
          });
        } catch (error) {
          authLogger.error('ProjectService', 'Error adding deliverable:', error);
          throw error;
        }
      }
  
      // Método para actualizar el estado de un entregable
      async updateDeliverableStatus(
        projectId: string,
        deliverableId: string,
        status: 'pending' | 'in_progress' | 'completed'
      ): Promise<void> {
        try {
          const projectRef = doc(this.projectsCollection, projectId);
          const project = await getDoc(projectRef);
          
          if (!project.exists()) {
            throw new Error('Project not found');
          }
  
          const data = project.data();
          const deliverables = data.deliverables || [];
          const updatedDeliverables = deliverables.map((d: ProjectDeliverable) => 
            d.id === deliverableId ? { ...d, status } : d
          );
  
          await updateDoc(projectRef, {
            deliverables: updatedDeliverables,
            updatedAt: new Date().toISOString()
          });
  
          authLogger.info('ProjectService', 'Deliverable status updated', { 
            projectId,
            deliverableId,
            status
          });
        } catch (error) {
          authLogger.error('ProjectService', 'Error updating deliverable status:', error);
          throw error;
        }
      }
}
  
export const projectService = new ProjectService();