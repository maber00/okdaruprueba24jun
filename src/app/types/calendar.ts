export type CalendarEventMetadata = {
    description?: string;
    location?: string;
    url?: string;
    color?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    reminder?: {
      time: number;
      unit: 'minutes' | 'hours' | 'days';
    };
    customFields?: Record<string, string | number | boolean>;
  };
  
  export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    projectId?: string;
    type: 'task' | 'deliverable' | 'meeting';
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
    assignedTo: string[];
    createdBy: string;
    metadata?: CalendarEventMetadata;
  }
  
  export interface CalendarView {
    type: 'day' | 'week' | 'month';
    filters?: {
      projects?: string[];
      users?: string[];
      types?: string[];
      status?: string[];
    };
  }
  