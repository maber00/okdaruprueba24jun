// src/app/services/projectService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
  updateDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type {
  Project,
  ProjectMember,
  ProjectTimeline,
  ProjectDeliverable,
  Permission,
  TeamRole,
  ProjectStatus,
} from '@/app/types/project';

interface Deliverable {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  [key: string]: unknown;
}

// Clase de error personalizada
export class ProjectServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'INVALID_STATUS' | 'INVALID_DATA' | 'UNAUTHORIZED' | 'UNKNOWN',
    public context?: unknown
  ) {
    super(message);
    this.name = 'ProjectServiceError';
  }
}


// Clase del servicio de proyectos
class ProjectService {
  private projectsCollection = collection(db, 'projects');
  private defaultPermissions: Permission[] = [];


  async getUserProjects(userId: string): Promise<Project[]> {
    // 1. Si userId viene vacío o undefined, lanzamos error con mensaje
    if (!userId) {
      throw new ProjectServiceError('No userId provided to getUserProjects', 'UNKNOWN');
    }

    try {
      console.log(`Fetching projects for user ID: ${userId}`);
      const q = query(
        this.projectsCollection,
        where('clientId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No projects found for user ID: ${userId}`);
      return [];
    }

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      if (!data || !data.createdAt) {
        console.error('Documento con datos incompletos:', docSnap.id, data);
        throw new ProjectServiceError(
          `Document ${docSnap.id} is missing required fields`,
          'INVALID_DATA',
          { documentId: docSnap.id, data }
        );
      }
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || null,
        startDate: data.startDate?.toDate() || null,
      } as Project;
    });

  } catch (error) {
    console.error('Error in getUserProjects RAW:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    throw new ProjectServiceError(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch user projects', 
      'UNKNOWN',
      error
    );
  }
}

async updateDeliverableStatus(
  projectId: string,
  deliverableId: string,
  status: Deliverable['status']
): Promise<void> {
  const projectRef = doc(this.projectsCollection, projectId);
  const project = await getDoc(projectRef);
  
  if (!project.exists()) {
    throw new ProjectServiceError('Project not found', 'NOT_FOUND');
  }

  const projectData = project.data();
  const deliverables = projectData.deliverables as Deliverable[] || [];
  const updatedDeliverables = deliverables.map((d: Deliverable) => 
    d.id === deliverableId ? { ...d, status } : d
  );

  await updateDoc(projectRef, {
    deliverables: updatedDeliverables,
    updatedAt: Timestamp.now()
  });
}


async getProjectStats(userId: string) {
  const projects = await this.getUserProjects(userId);
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length
  };
}


  // Obtener un proyecto por ID
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
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        startDate: data.startDate?.toDate() || new Date(),
      } as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new ProjectServiceError('Failed to fetch project', 'NOT_FOUND', error);
    }
  }

  // Crear nuevo proyecto
  async createProject(projectData: Partial<Project>): Promise<string> {
    try {
      const defaultData = {
        status: 'inquiry',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        team: [],
        timeline: [],
        deliverables: [],
        brief: {
          approved: false,
          content: {},
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      };

      const docRef = await addDoc(this.projectsCollection, { ...defaultData, ...projectData });
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new ProjectServiceError('Failed to create project', 'UNKNOWN', error);
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
      const projectRef = doc(this.projectsCollection, projectId);
      const timelineEntry: ProjectTimeline = {
        id: Date.now().toString(),
        projectId,
        status,
        updatedBy: userId,
        comment,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(projectRef, {
        status,
        updatedAt: Timestamp.now(),
        timeline: arrayUnion(timelineEntry),
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new ProjectServiceError('Failed to update project status', 'UNKNOWN', error);
    }
  }

  // Añadir entregable
  async addDeliverable(projectId: string, deliverable: Omit<ProjectDeliverable, 'id'>): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const deliverableWithId = { ...deliverable, id: Date.now().toString() };

      await updateDoc(projectRef, {
        deliverables: arrayUnion(deliverableWithId),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding deliverable:', error);
      throw new ProjectServiceError('Failed to add deliverable', 'UNKNOWN', error);
    }
  }

  

  // Agregar miembro al equipo
  async addTeamMember(
    projectId: string,
    email: string,
    role: TeamRole,
    customPermissions: Permission[] = []
  ): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);

      const project = await getDoc(projectRef);
      if (!project.exists()) {
        throw new ProjectServiceError('Project not found', 'NOT_FOUND');
      }

      const allPermissions: Permission[] = [...this.defaultPermissions, ...customPermissions];

      const member: ProjectMember = {
        id: Date.now().toString(),
        userId: email,
        role,
        permissions: allPermissions,
        joinedAt: new Date().toISOString(),
      };

      await updateDoc(projectRef, {
        team: arrayUnion(member),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new ProjectServiceError('Failed to add team member', 'UNKNOWN', error);
    }
  }

  // Eliminar miembro del equipo
  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);

      const project = await getDoc(projectRef);
      if (!project.exists()) {
        throw new ProjectServiceError('Project not found', 'NOT_FOUND');
      }

      const data = project.data();
      const updatedTeam = data.team.filter(
        (member: ProjectMember) => member.id !== memberId
      );

      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new ProjectServiceError('Failed to remove team member', 'UNKNOWN', error);
    }
  }
}

   

export async function createTestProject(userId: string) {
  try {
    const projectsRef = collection(db, 'projects');
    
    const projectData = {
      name: "Proyecto Test",
      type: "design",
      status: "draft",
      description: "Proyecto de prueba",
      clientId: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      startDate: Timestamp.now(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      brief: {
        approved: false,
        content: {},
        updatedAt: new Date().toISOString(),
        version: 1
      },
      team: [],
      timeline: [],
      deliverables: [],
      metadata: {
        priority: "medium",
        tags: [],
        progress: 0,
        healthStatus: "on-track"
      }
    };

    const docRef = await addDoc(projectsRef, projectData);
    console.log('Proyecto creado con ID:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('Error al crear proyecto:', error);
    throw new ProjectServiceError(
      'Error al crear proyecto de prueba',
      'UNKNOWN',
      error
    );
  }
}

 

export const projectService = new ProjectService();
