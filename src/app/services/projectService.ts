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
  type QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { authLogger } from '@/app/lib/logger';
import type { 
  Project,
  ProjectStatus,
  ProjectMember,
  ProjectTimeline,
  ProjectDeliverable,
  Permission,
  TeamRole,
  BriefContent,
  AIAnalysis
} from '@/app/types/project';

// Error personalizado para el servicio
class ProjectServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'INVALID_STATUS' | 'INVALID_DATA' | 'UNAUTHORIZED' | 'UNKNOWN',
    public context?: unknown
  ) {
    super(message);
    this.name = 'ProjectServiceError';
  }
}

// Validar estado del proyecto
const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return ['inquiry', 'draft', 'briefing', 'review', 'approved', 
          'in_progress', 'client_review', 'revisions', 'completed', 
          'cancelled'].includes(status);
};

class ProjectService {
  private projectsCollection = collection(db, 'projects');
  private defaultPermissions: Permission[] = ['view_project'];


  // Crear nuevo proyecto (puede iniciar como inquiry o draft)
  async createProject(
    projectData: Partial<Project>,
    aiAnalysis?: AIAnalysis
  ): Promise<string> {
    try {
      const defaultData = {
        status: 'inquiry' as ProjectStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'DARU',
        team: [],
        timeline: [],
        deliverables: [],
        brief: {
          approved: false,
          content: {},
          updatedAt: new Date().toISOString(),
          version: 1  // Añadimos la versión inicial
        },
        metadata: {
          priority: 'medium',
          tags: [],
          aiAnalysis
        }
      };
      

      const docRef = await addDoc(
        this.projectsCollection, 
        { ...defaultData, ...projectData }
      );

      authLogger.info('ProjectService', 'Project created', { 
        projectId: docRef.id 
      });

      return docRef.id;
    } catch (error) {
      authLogger.error('ProjectService', 'Error creating project:', error);
      throw new ProjectServiceError(
        'Failed to create project',
        'UNKNOWN',
        error
      );
    }
  }

  // Obtener proyecto por ID
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(this.projectsCollection, projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        dueDate: data.dueDate?.toDate?.() || data.dueDate,
        startDate: data.startDate?.toDate?.() || data.startDate,
      } as Project;
    } catch (error) {
      authLogger.error('ProjectService', 'Error getting project:', error);
      throw new ProjectServiceError(
        'Failed to fetch project',
        'NOT_FOUND',
        error
      );
    }
  }

  // Obtener proyectos del usuario
  async getUserProjects(userId: string, role?: ProjectMember['role']): Promise<Project[]> {
    try {
      let constraints: QueryConstraint[] = [];
      
      if (role) {
        constraints = [
          where('team', 'array-contains', {
            userId,
            role,
          }),
          orderBy('createdAt', 'desc')
        ];
      } else {
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
  
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          dueDate: data.dueDate?.toDate?.() || data.dueDate,
          startDate: data.startDate?.toDate?.() || data.startDate,
        };
      }) as Project[];
    } catch (error) {
      authLogger.error('ProjectService', 'Error getting user projects:', error);
      throw new ProjectServiceError(
        'Failed to fetch user projects',
        'UNKNOWN',
        error
      );
    }
  }

  // Actualizar estado del proyecto
  async updateProjectStatus(
    projectId: string, 
    status: ProjectStatus, 
    userId: string, 
    comment?: string
  ): Promise<void> {
    try {
      // Validar el estado
      if (!isValidProjectStatus(status)) {
        throw new ProjectServiceError(
          `Invalid project status: ${status}`,
          'INVALID_STATUS'
        );
      }

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
        updatedAt: Timestamp.now(),
        'timeline': arrayUnion(timelineEntry)
      });
      
      authLogger.info('ProjectService', 'Project status updated', { 
        projectId, 
        status, 
        userId 
      });
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      authLogger.error('ProjectService', 'Error updating project status:', error);
      throw new ProjectServiceError(
        'Failed to update project status',
        'UNKNOWN',
        error
      );
    }
  }

// Agregar miembro al equipo del proyecto
async addTeamMember(
  projectId: string,
  email: string,
  role: TeamRole,
  customPermissions: Permission[] = []
): Promise<void> {
  try {
    const projectRef = doc(this.projectsCollection, projectId);
    
    // Verificar que el proyecto existe
    const project = await getDoc(projectRef);
    if (!project.exists()) {
      throw new ProjectServiceError(
        'Project not found',
        'NOT_FOUND'
      );
    }

    const allPermissions: Permission[] = [...this.defaultPermissions, ...customPermissions];

    const member: ProjectMember = {
      id: Date.now().toString(),
      userId: email,
      role,
      permissions: allPermissions,
      joinedAt: new Date().toISOString()
    };

    await updateDoc(projectRef, {
      team: arrayUnion(member),
      updatedAt: Timestamp.now()
    });

    authLogger.info('ProjectService', 'Team member added', { 
      projectId, 
      role,
      email 
    });
  } catch (error) {
    if (error instanceof ProjectServiceError) {
      throw error;
    }
    authLogger.error('ProjectService', 'Error adding team member:', error);
    throw new ProjectServiceError(
      'Failed to add team member',
      'UNKNOWN',
      error
    );
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
        updatedAt: new Date().toISOString(),
        version: 1 // Añadimos la versión requerida
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
      async removeTeamMember(projectId: string, memberId: string): Promise<void> {
        try {
          const projectRef = doc(this.projectsCollection, projectId);
          const project = await getDoc(projectRef);
          
          if (!project.exists()) {
            throw new Error('Project not found');
          }
    
          const data = project.data();
          const updatedTeam = data.team.filter(
            (member: ProjectMember) => member.id !== memberId
          );
    
          await updateDoc(projectRef, {
            team: updatedTeam,
            updatedAt: new Date().toISOString()
          });
    
          authLogger.info('ProjectService', 'Team member removed', { 
            projectId, 
            memberId 
          });
        } catch (error) {
          authLogger.error('ProjectService', 'Error removing team member:', error);
          throw error;
        }
      }
    }
  
export const projectService = new ProjectService();
export type { ProjectServiceError };
