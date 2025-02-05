// src/services/planningService.ts
import { db } from '@/app/lib/firebase';
import { collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import type { BriefData } from '@/app/types/brief';
import type { ProjectTimeline, Milestone } from '@/app/types/planning';
import type { ChecklistItem } from '@/app/types/checklist';
import { checklistService } from './checklistService';
import { aiTimelineService } from './aiTimelineService';

class PlanningService {
  private timelineCollection = collection(db, 'timelines');

  async generateProjectTimeline(
    brief: BriefData,
    checklist: ChecklistItem[]
  ): Promise<ProjectTimeline> {
    try {
      // Generar timeline usando IA
      const timeline = await aiTimelineService.generateTimelineFromBrief(brief);
      
      // Integrar checklist con los milestones
      const milestones = await this.generateMilestones(timeline, checklist);
      
      const newTimeline = {
        projectId: brief.projectId,
        startDate: new Date(),
        endDate: this.calculateEndDate(timeline),
        milestones,
        checklistItems: checklist,
        assignedTeam: await this.assignTeam(brief),
        progress: 0,
        status: 'active' as const,
        lastUpdated: new Date()
      };

      const docRef = await addDoc(this.timelineCollection, newTimeline);

      return {
        id: docRef.id,
        ...newTimeline
      };
    } catch (error) {
      console.error('Error generating project timeline:', error);
      throw error;
    }
  }

  private calculateEndDate(timeline: ProjectTimeline): Date {
    const lastMilestone = timeline.milestones
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0];
    return lastMilestone?.dueDate || new Date();
  }

  async updateTimelineProgress(
    timelineId: string,
    progress: number
  ): Promise<void> {
    try {
      await updateDoc(doc(this.timelineCollection, timelineId), {
        progress,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating timeline progress:', error);
      throw error;
    }
  }

  async getProjectTimeline(projectId: string): Promise<ProjectTimeline | null> {
    try {
      const q = query(
        this.timelineCollection,
        where('projectId', '==', projectId)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as ProjectTimeline;
    } catch (error) {
      console.error('Error fetching project timeline:', error);
      throw error;
    }
  }

  private async assignTeam(brief: BriefData): Promise<string[]> {
    // Implementar lógica de asignación de equipo basada en el brief
    // Por ahora retorna array vacío
    return [];
  }
}

export const planningService = new PlanningService();