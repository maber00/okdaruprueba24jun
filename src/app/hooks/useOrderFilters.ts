// src/app/hooks/useOrderFilters.ts
import { useState, useMemo } from 'react';
import type { Order, ServiceType, Priority } from '@/app/types/order';

// Define el tipo AIStatus
type AIStatus = 'pending' | 'in_progress' | 'completed';

// Corregir el nombre de la interfaz a OrderFilters (no useOrderFilters)
export interface OrderFilters {
  serviceType: ServiceType | 'all';
  priority: Priority | 'all';
  aiStatus: AIStatus | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm: string;
}

export function useOrderFilters(orders: Order[]) {
  // Estados con tipos correctos
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceType, setServiceType] = useState<OrderFilters['serviceType']>('all');
  const [priority, setPriority] = useState<OrderFilters['priority']>('all');
  const [aiStatus, setAIStatus] = useState<OrderFilters['aiStatus']>('all');
  const [dateRange, setDateRange] = useState<OrderFilters['dateRange']>({
    start: null,
    end: null
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesServiceType = serviceType === 'all' || order.serviceType === serviceType;
      const matchesPriority = priority === 'all' || order.priority === priority;
      const matchesAIStatus = aiStatus === 'all' || order.aiAnalysis?.status === aiStatus;
      const matchesDateRange = (!dateRange.start || order.createdAt >= dateRange.start) &&
                             (!dateRange.end || order.createdAt <= dateRange.end);

      return matchesSearch && matchesServiceType && matchesPriority && matchesAIStatus && matchesDateRange;
    });
  }, [orders, searchTerm, serviceType, priority, aiStatus, dateRange]);

  // Crear un objeto filters que coincida con la interfaz OrderFilters
  const filters: OrderFilters = {
    searchTerm,
    serviceType,
    priority,
    aiStatus,
    dateRange
  };

  return {
    filters,
    setters: {
      setSearchTerm,
      setServiceType,
      setPriority,
      setAIStatus,
      setDateRange
    },
    filteredOrders
  };
}