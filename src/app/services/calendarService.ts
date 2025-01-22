// src/app/services/calendarService.ts
import { 
    collection, 
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy 
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { CalendarEvent } from '@/app/types/calendar';  // Removemos CalendarView ya que no se usa
import { authLogger } from '@/app/lib/logger';


class CalendarService {
  private eventsCollection = collection(db, 'events');

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.eventsCollection, {
        ...event,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      authLogger.error('CalendarService', 'Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      const eventRef = doc(this.eventsCollection, id);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      authLogger.error('CalendarService', 'Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.eventsCollection, id));
    } catch (error) {
      authLogger.error('CalendarService', 'Error deleting event:', error);
      throw error;
    }
  }

  async getGlobalCalendar(): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        orderBy('start', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];
    } catch (error) {
      authLogger.error('CalendarService', 'Error fetching global calendar:', error);
      throw error;
    }
  }

  async getTeamCalendar(teamId: string): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('teamId', '==', teamId),
        orderBy('start', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];
    } catch (error) {
      authLogger.error('CalendarService', 'Error fetching team calendar:', error);
      throw error;
    }
  }

  async getPersonalCalendar(userId: string): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('assignedTo', 'array-contains', userId),
        orderBy('start', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];
    } catch (error) {
      authLogger.error('CalendarService', 'Error fetching personal calendar:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();