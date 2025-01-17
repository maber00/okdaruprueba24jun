// src/app/services/taskService.ts
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/lib/firebase';
import { authLogger } from '@/app/lib/logger';
import type { Task, Attachment, Comment } from '@/app/types/task';

class TaskService {
    private tasksCollection = collection(db, 'tasks');

    async createTask(taskData: Omit<Task, 'id'>): Promise<string> {
        try {
          // Asegurar que assignedTo siempre sea un array
          const data = {
            ...taskData,
            assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [taskData.assignedTo],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [],  // Inicializar arrays vacíos
            comments: []
          };
      
          const docRef = await addDoc(this.tasksCollection, data);
          return docRef.id;
        } catch (error) {
          authLogger.error('TaskService', 'Error creating task:', error);
          throw error;
        }
      }
      
      

    async getTask(taskId: string): Promise<Task | null> {
        try {
            const docRef = doc(this.tasksCollection, taskId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Task;
        } catch (error) {
            authLogger.error('TaskService', 'Error getting task:', error);
            throw error;
        }
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        try {
            authLogger.info('TaskService', 'Iniciando getUserTasks', { userId });

            // Crear la consulta
            const q = query(
                this.tasksCollection,
                where('assignedTo', 'array-contains', userId),
                orderBy('startTime', 'asc')
            );

            authLogger.info('TaskService', 'Consulta creada', { query: q });

            // Ejecutar la consulta
            const snapshot = await getDocs(q);
            
            authLogger.info('TaskService', 'Datos obtenidos', { 
                count: snapshot.size,
                empty: snapshot.empty 
            });

            // Mapear los resultados
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Task[];

            authLogger.info('TaskService', 'Tareas procesadas', { 
                tasksCount: tasks.length
            });

            return tasks;
        } catch (error) {
            authLogger.error('TaskService', 'Error en getUserTasks', error);
            throw error;
        }
    }

    

    async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
        try {
            const taskRef = doc(this.tasksCollection, taskId);
            await updateDoc(taskRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            authLogger.error('TaskService', 'Error updating task:', error);
            throw error;
        }
    }

    async uploadTaskFile(taskId: string, file: File, userId: string): Promise<string> {
        try {
            const fileRef = ref(storage, `tasks/${taskId}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            const attachment: Attachment = {
                id: Date.now().toString(),
                taskId,
                fileName: file.name,
                fileUrl,
                fileType: file.type,
                uploadedBy: userId,
                uploadedAt: new Date().toISOString()
            };

            const taskRef = doc(this.tasksCollection, taskId);
            await updateDoc(taskRef, {
                attachments: arrayUnion(attachment),
                updatedAt: new Date().toISOString()
            });

            return fileUrl;
        } catch (error) {
            authLogger.error('TaskService', 'Error uploading file:', error);
            throw error;
        }
    }

    async addComment(taskId: string, comment: { content: string; userId: string }): Promise<void> {
        try {
            const taskRef = doc(this.tasksCollection, taskId);
            const newComment: Comment = {
                id: Date.now().toString(),
                taskId,
                content: comment.content,
                userId: comment.userId,
                createdAt: new Date().toISOString()
            };

            await updateDoc(taskRef, {
                comments: arrayUnion(newComment),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            authLogger.error('TaskService', 'Error adding comment:', error);
            throw error;
        }
    }

    async deleteTask(taskId: string): Promise<void> {
        try {
            await updateDoc(doc(this.tasksCollection, taskId), {
                status: 'deleted',
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            authLogger.error('TaskService', 'Error deleting task:', error);
            throw error;
        }
    }
}

export const taskService = new TaskService();