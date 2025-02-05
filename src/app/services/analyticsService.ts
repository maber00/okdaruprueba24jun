import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from '@/app/lib/firebase';
  import { authLogger } from '@/app/lib/logger';
  
  type MetricType = 'users' | 'projects' | 'revenue' | 'tasks';
  
  interface MetricFilter {
    startDate?: Date;
    endDate?: Date;
    type?: MetricType;
    userId?: string;
    projectId?: string;
  }
  
  interface MetricData {
    value: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }
  
  interface AnalyticsData {
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
    active: number;
    completed: number;
  }
  
  class AnalyticsService {
    private metricsCollection = collection(db, 'metrics');
    private analyticsCollection = collection(db, 'analytics');
  
    async getMetrics(filter: MetricFilter = {}): Promise<MetricData[]> {
      try {
        const constraints = [];
  
        if (filter.startDate) {
          constraints.push(where('timestamp', '>=', Timestamp.fromDate(filter.startDate)));
        }
        if (filter.endDate) {
          constraints.push(where('timestamp', '<=', Timestamp.fromDate(filter.endDate)));
        }
        if (filter.type) {
          constraints.push(where('type', '==', filter.type));
        }
        if (filter.userId) {
          constraints.push(where('userId', '==', filter.userId));
        }
        if (filter.projectId) {
          constraints.push(where('projectId', '==', filter.projectId));
        }
  
        constraints.push(orderBy('timestamp', 'desc'));
  
        const q = query(this.metricsCollection, ...constraints);
        const snapshot = await getDocs(q);
  
        return snapshot.docs.map(doc => ({
          value: doc.data().value,
          timestamp: doc.data().timestamp.toDate(),
          metadata: doc.data().metadata
        }));
  
      } catch (error) {
        authLogger.error('AnalyticsService', 'Error fetching metrics', error);
        throw error;
      }
    }
  
    private processMetricsForReport(metrics: MetricData[]): AnalyticsData {
      const initialData: AnalyticsData = {
        byRole: {},
        byStatus: {},
        total: 0,
        active: 0,
        completed: 0
      };
  
      return metrics.reduce((acc, metric) => {
        if (metric.metadata) {
          const role = (metric.metadata.role as string) || 'unknown';
          const status = (metric.metadata.status as string) || 'unknown';
          
          acc.byRole[role] = (acc.byRole[role] || 0) + 1;
          acc.byStatus[status] = (acc.byStatus[status] || 0) + 1;
          
          if (status === 'active') acc.active += 1;
          if (status === 'completed') acc.completed += 1;
          acc.total += 1;
        }
        return acc;
      }, initialData);
    }
  
    async generateReport(type: string, dateRange: { start: Date; end: Date }): Promise<AnalyticsData> {
      try {
        const metrics = await this.getMetrics({
          startDate: dateRange.start,
          endDate: dateRange.end,
          type: type as MetricType
        });
  
        return this.processMetricsForReport(metrics);
      } catch (error) {
        authLogger.error('AnalyticsService', 'Error generating report', error);
        throw error;
      }
    }
  }
  
  export const analyticsService = new AnalyticsService();