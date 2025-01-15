// src/app/services/taskService.ts
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    getDoc,
    getDocs
  } from 'firebase/firestore';
  import { db } from '@/app/lib/firebase';
  import type { Task, Comment, Attachment, TaskStatus } from '@/app/types/task';
  
  class TaskService {
    private taskCollection = collection(db, 'tasks');
  
    async createTask(taskData: Omit<Task, 'id'>): Promise<string> {
      try {
        const docRef = await addDoc(this.taskCollection, {
          ...taskData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    }
  
    async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
      try {
        const taskRef = doc(this.taskCollection, taskId);
        await updateDoc(taskRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    }
  
    async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
      try {
        const taskRef = doc(this.taskCollection, taskId);
        await updateDoc(taskRef, {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    }
  
    async getProjectTasks(projectId: string): Promise<Task[]> {
      try {
        const q = query(
          this.taskCollection,
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
      } catch (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
    }
  
    async getUserTasks(userId: string): Promise<Task[]> {
      try {
        const q = query(
          this.taskCollection,
          where('assignedTo', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
      } catch (error) {
        console.error('Error fetching user tasks:', error);
        throw error;
      }
    }
  
    async addComment(taskId: string, comment: Omit<Comment, 'id' | 'taskId'>): Promise<void> {
      try {
        const taskRef = doc(this.taskCollection, taskId);
        const taskDoc = await getDoc(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('Task not found');
        }
  
        const currentComments = taskDoc.data().comments || [];
        await updateDoc(taskRef, {
          comments: [...currentComments, { ...comment, id: Date.now().toString(), taskId }],
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    }
  
    async addAttachment(taskId: string, attachment: Omit<Attachment, 'id' | 'taskId'>): Promise<void> {
      try {
        const taskRef = doc(this.taskCollection, taskId);
        const taskDoc = await getDoc(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('Task not found');
        }
  
        const currentAttachments = taskDoc.data().attachments || [];
        await updateDoc(taskRef, {
          attachments: [...currentAttachments, { ...attachment, id: Date.now().toString(), taskId }],
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error adding attachment:', error);
        throw error;
      }
    }
  
    async deleteTask(taskId: string): Promise<void> {
      try {
        await deleteDoc(doc(this.taskCollection, taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    }
  }
  
  export const taskService = new TaskService();