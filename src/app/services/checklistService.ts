// src/app/services/checklistService.ts
import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { Project, ProjectType } from '@/app/types/project';
import type { BriefData } from '@/app/types/brief';
import { OpenAIService } from '@/app/core/ai/services/openaiService';

interface ChecklistItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dependsOn?: string[];
  assignedTo?: string;
  dueDate?: Date;
  comments?: string[];
  category?: string;
  tags?: string[];
}

interface Checklist {
  id: string;
  projectId: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  completionStatus: number;
  nextAction?: string;
}

export class ChecklistService {
  private checklistsCollection = collection(db, 'checklists');
  private aiService = new OpenAIService();

  async generateChecklist(project: Project): Promise<Checklist> {
    try {
      const items = await this.generateChecklistItems(project.type, project.brief);
      
      const checklist = {
        projectId: project.id,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
        completionStatus: 0,
        nextAction: items[0]?.description
      };

      const docRef = await addDoc(this.checklistsCollection, checklist);
      
      return {
        id: docRef.id,
        ...checklist
      };
    } catch (error) {
      console.error('Error en generación de checklist:', error);
      throw error;
    }
  }

  private async generateChecklistItems(
    projectType: ProjectType, 
    brief: BriefData
  ): Promise<ChecklistItem[]> {
    // Usar OpenAI para generar items basados en el tipo y brief
    const prompt = this.createChecklistPrompt(projectType, brief);
    const aiResponse = await this.aiService.generateChatCompletion([{
      role: 'system',
      content: prompt
    }]);

    return this.parseAIResponse(aiResponse || '');
  }

  private createChecklistPrompt(projectType: ProjectType, brief: BriefData): string {
    return `Genera una lista detallada de tareas para un proyecto de ${projectType}
    basado en el siguiente brief:
    ${JSON.stringify(brief)}
    
    Incluye:
    - Tareas específicas y accionables
    - Prioridades
    - Dependencias entre tareas
    - Categorías o etapas
    - Tiempos estimados`;
  }

  private parseAIResponse(response: string): ChecklistItem[] {
    try {
      // Implementar parsing del response de OpenAI a ChecklistItem[]
      const items: ChecklistItem[] = JSON.parse(response);
      return items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        status: 'pending'
      }));
    } catch (error) {
      console.error('Error parseando respuesta AI:', error);
      // Retornar checklist por defecto si falla el parsing
      return this.getDefaultChecklist();
    }
  }

  private getDefaultChecklist(): ChecklistItem[] {
    return [
      {
        id: crypto.randomUUID(),
        description: 'Revisar brief técnico',
        priority: 'high',
        status: 'pending',
        category: 'Inicio'
      }
    ];
  }

  async updateChecklistItem(
    checklistId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<void> {
    try {
      const checklistRef = doc(this.checklistsCollection, checklistId);
      const checklistDoc = await getDoc(checklistRef);
      
      if (!checklistDoc.exists()) {
        throw new Error('Checklist no encontrado');
      }

      const checklist = checklistDoc.data() as Checklist;
      const updatedItems = checklist.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      const completionStatus = this.calculateCompletionStatus(updatedItems);
      const nextAction = this.determineNextAction(updatedItems);

      await updateDoc(checklistRef, {
        items: updatedItems,
        completionStatus,
        nextAction,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando checklist:', error);
      throw error;
    }
  }

  private calculateCompletionStatus(items: ChecklistItem[]): number {
    const completed = items.filter(item => item.status === 'completed').length;
    return (completed / items.length) * 100;
  }

  private determineNextAction(items: ChecklistItem[]): string {
    const nextItem = items.find(item => 
      item.status === 'pending' && 
      (!item.dependsOn || 
        item.dependsOn.every(depId => 
          items.find(i => i.id === depId)?.status === 'completed'
        )
      )
    );
    return nextItem?.description || '';
  }

  async getProjectChecklists(projectId: string): Promise<Checklist[]> {
    try {
      const q = query(
        this.checklistsCollection,
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Checklist));
    } catch (error) {
      console.error('Error obteniendo checklists:', error);
      throw error;
    }
  }

  async isChecklistComplete(checklistId: string): Promise<boolean> {
    try {
      const checklistRef = doc(this.checklistsCollection, checklistId);
      const checklistDoc = await getDoc(checklistRef);
      
      if (!checklistDoc.exists()) {
        throw new Error('Checklist no encontrado');
      }

      const checklist = checklistDoc.data() as Checklist;
      return checklist.items.every(item => item.status === 'completed');
    } catch (error) {
      console.error('Error verificando completion:', error);
      throw error;
    }
  }
}

export const checklistService = new ChecklistService();