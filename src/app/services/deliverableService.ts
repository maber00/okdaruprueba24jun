// src/app/services/deliverableService.ts
import { 
  collection, 
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { 
  Deliverable,
  DeliverableFile,
  Feedback 
} from '@/app/types/deliverable';
import type { ChecklistItem } from '@/app/types/checklist';
import type { BriefData } from '@/app/types/brief';
import { OpenAIService } from '@/app/core/ai/services/openaiService';
import { authLogger } from '@/app/lib/logger';

class DeliverableService {
private deliverablesCollection = collection(db, 'deliverables');
private aiService = new OpenAIService();

async createDeliverable(data: Omit<Deliverable, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(this.deliverablesCollection, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    authLogger.error('DeliverableService', 'Error creating deliverable:', error);
    throw error;
  }
}

async updateDeliverable(id: string, updates: Partial<Deliverable>): Promise<void> {
  try {
    const deliverableRef = doc(this.deliverablesCollection, id);
    await updateDoc(deliverableRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    authLogger.error('DeliverableService', 'Error updating deliverable:', error);
    throw error;
  }
}

async addFeedback(deliverableId: string, feedback: Omit<Feedback, 'id'>): Promise<void> {
  try {
    const deliverableRef = doc(this.deliverablesCollection, deliverableId);
    await updateDoc(deliverableRef, {
      feedback: arrayUnion({
        id: Date.now().toString(),
        ...feedback,
        createdAt: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    authLogger.error('DeliverableService', 'Error adding feedback:', error);
    throw error;
  }
}

async generateDeliverableChecklist(brief: BriefData): Promise<ChecklistItem[]> {
  try {
    const prompt = this.createPromptFromBrief(brief);
    const completion = await this.aiService.generateChatCompletion([{
      role: 'system',
      content: prompt
    }]);

    return this.parseResponse(completion || '');
  } catch (error) {
    authLogger.error('DeliverableService', 'Error generating checklist:', error);
    throw error;
  }
}

private createPromptFromBrief(brief: BriefData): string {
  return `Genera una lista de entregables necesarios para este proyecto:
    ${JSON.stringify(brief, null, 2)}
  `;
}

private parseResponse(response: string): ChecklistItem[] {
  try {
    const parsedResponse = JSON.parse(response);
    return parsedResponse.map((item: any) => ({
      id: crypto.randomUUID(),
      description: item.description,
      status: 'pending',
      priority: item.priority || 'medium',
      category: item.category || 'general'
    }));
  } catch (error) {
    authLogger.error('DeliverableService', 'Error parsing response:', error);
    return [];
  }
}

async getFeedback(deliverableId: string): Promise<Feedback[]> {
  try {
    const deliverableRef = doc(this.deliverablesCollection, deliverableId);
    const deliverableDoc = await getDoc(deliverableRef);
    
    if (!deliverableDoc.exists()) {
      throw new Error('Deliverable not found');
    }
    
    const deliverable = deliverableDoc.data() as Deliverable;
    return deliverable.feedback || [];
  } catch (error) {
    authLogger.error('DeliverableService', 'Error getting feedback:', error);
    throw error;
  }
}
}

export const deliverableService = new DeliverableService();