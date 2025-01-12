// src/app/types/order.ts

export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'in_review'
  | 'approved'
  | 'completed'
  | 'cancelled';

// Tipos de servicios disponibles
export type ServiceType = 
  | 'design'
  | 'video'
  | 'animation'
  | 'web_design'
  | 'web_development';

// Prioridades posibles
export type Priority = 'low' | 'medium' | 'high';

// Interface para el análisis de IA
export interface AIOrderAnalysis {
  status: 'pending' | 'in_progress' | 'completed';
  suggestions: string[];
  priority: Priority;
  complexity: Priority;
  reviewedAt: Date | null;
}

// Interface principal de un pedido
export interface Order {
  id?: string;
  title: string;
  description: string;
  serviceType: ServiceType;
  status: OrderStatus;
  priority: Priority;
  dueDate: Date;
  clientId: string;
  assignedTo: string[];
  budget?: number;
  attachments?: string[];
  tags?: string[];
  aiAnalysis?: AIOrderAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

// Props para los componentes de vista
export interface TableViewProps {
  orders: Order[];
  handleDeleteOrder: (orderId: string) => Promise<void>;
}

export interface GridViewProps {
  orders: Order[];
  handleDeleteOrder: (orderId: string) => Promise<void>;
}

export interface GroupedOrdersViewProps {
  viewType: 'list' | 'grid';
  groupedOrders: Record<OrderStatus, Order[]>;
  handleDeleteOrder: (orderId: string) => Promise<void>;
}

// Props para filtros y búsqueda
export interface OrderFilters {
  searchTerm: string;
  serviceType: ServiceType | 'all';
  priority: Priority | 'all';
  aiStatus: AIOrderAnalysis['status'] | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Interface para notificaciones
export interface OrderNotification {
  id: string;
  type: 'new_order' | 'status_change' | 'ai_update';
  message: string;
  timestamp: Date;
  read: boolean;
  orderId: string;
}

// Props para acciones de pedidos
export interface OrderActions {
  onDelete: (orderId: string) => Promise<void>;
  onEdit: (orderId: string) => void;
  onView: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}
