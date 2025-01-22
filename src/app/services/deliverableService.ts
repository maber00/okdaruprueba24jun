// src/app/services/deliverableService.ts
import { 
    collection, 
    doc,
    addDoc,
    updateDoc,
    arrayUnion,
    getDoc,
    getDocs  // Añadimos getDocs
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { 
    Deliverable, 
    Feedback 
} from '@/app/types/deliverable';  // Removemos DeliverableFile ya que no se usa
import { authLogger } from '@/app/lib/logger';

class DeliverableService {
  private deliverablesCollection = collection(db, 'deliverables');

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

  async updateFeedbackStatus(feedbackId: string, status: Feedback['status']): Promise<void> {
    try {
      const deliverables = await getDocs(this.deliverablesCollection);
      
      for (const deliverableDoc of deliverables.docs) {
        const deliverable = deliverableDoc.data() as Deliverable;
        const feedback = deliverable.feedback?.find(f => f.id === feedbackId);
        
        if (feedback) {
          const updatedFeedback = deliverable.feedback?.map(f => 
            f.id === feedbackId ? { ...f, status } : f
          );
          
          await updateDoc(deliverableDoc.ref, {
            feedback: updatedFeedback,
            updatedAt: new Date().toISOString()
          });
          
          break;
        }
      }
    } catch (error) {
      authLogger.error('DeliverableService', 'Error updating feedback status:', error);
      throw error;
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