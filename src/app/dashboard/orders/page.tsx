// src/app/dashboard/orders/page.tsx
'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import Link from 'next/link';
import TimeRemaining from '@/app/shared/components/ui/TimeRemaining';
import PriorityBadge  from '@/app/shared/components/ui/PriorityBadge';
import { PermissionGate } from '@/app/core/auth/components/PermissionGate';
import { RoleGate } from '@/app/core/auth/components/RoleGate';
import { useAuth } from '@/app/core/auth/context/AuthContext';
import { FirebaseError } from 'firebase/app';
import { 
  Brain, 
  Bell, 
  List, 
  Grid, 
  Calendar, 
  Layers, 
  PlusCircle,
  Search,
  Flame,
  Eye,
  Edit,
  Trash
} from 'lucide-react';
import { Switch } from '@headlessui/react';
import type { OrderStatus, Order, AIOrderAnalysis, ServiceType } from '@/app/types/order';
import { useViewPreference } from '@/app/shared/hooks/useViewPreference';
import '@/app/styles/views.css';


// Interfaces
interface Notification {
  id: string;
  type: 'new_order' | 'status_change' | 'ai_update';
  message: string;
  timestamp: Date;
  read: boolean;
  orderId: string;
}

interface TableViewProps {
  orders: Order[];
  handleDeleteOrder: (orderId: string | undefined) => Promise<void>;
}

// Utilidades
const getStatusColor = (status: OrderStatus) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-600',
    in_progress: 'bg-blue-100 text-blue-600',
    in_review: 'bg-purple-100 text-purple-600',
    approved: 'bg-green-100 text-green-600',
    completed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600'
  };
  return colors[status];
};

const getAIStatusBadge = (aiAnalysis?: AIOrderAnalysis) => {
  if (!aiAnalysis) return null;

  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex items-center space-x-1">
      <Brain className="h-4 w-4 text-gray-500" />
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[aiAnalysis.status]}`}>
        {aiAnalysis.status === 'pending' ? 'Pendiente análisis' :
         aiAnalysis.status === 'in_progress' ? 'Analizando' : 
         'Analizado'}
      </span>
    </div>
  );
};


const getComplexityBadge = (aiAnalysis?: AIOrderAnalysis) => {
  if (!aiAnalysis?.complexity) return null;

  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${colors[aiAnalysis.complexity]}`}>
      Complejidad {aiAnalysis.complexity === 'low' ? 'Baja' :
                  aiAnalysis.complexity === 'medium' ? 'Media' : 'Alta'}
    </span>
  );
};
// Componentes de Vista
const TableView = ({ orders, handleDeleteOrder }: TableViewProps) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Pedido
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Cliente
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Prioridad
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Análisis IA
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Fecha de Entrega
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tiempo Restante
        </th>
        <th className="relative px-6 py-3">
          <span className="sr-only">Acciones</span>
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {orders.map((order) => (
        <tr key={order.id || 'temp-' + order.title}>
          <td className="px-6 py-4 whitespace-nowrap">
            {order.id ? (
              <Link 
                href={{
                  pathname: '/dashboard/orders/[id]',
                  query: { id: order.id }
                }}
                as={`/dashboard/orders/${order.id}`}
                className="group"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                  {order.title}
                </div>
                <div className="text-sm text-gray-500">{order.serviceType}</div>
              </Link>
           ) : (
            <div>
              <div className="font-medium text-gray-900">{order.title}</div>
              <div className="text-sm text-gray-500">{order.serviceType}</div>
            </div>
          )}
        </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">Cliente {order.clientId}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <PriorityBadge priority={order.priority} size="sm" />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col space-y-1">
              {getAIStatusBadge(order.aiAnalysis)}
              {getComplexityBadge(order.aiAnalysis)}
            </div>
          </td>

          
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {order.dueDate.toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <TimeRemaining dueDate={order.dueDate} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-2">
              <PermissionGate permission="view_orders">
                <Link 
                  href={{
                    pathname: '/dashboard/orders/[id]',
                    query: { id: order.id }
                  }}
                  as={`/dashboard/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Eye className="h-5 w-5" />
                </Link>
              </PermissionGate>

              <PermissionGate permission="edit_order">
                <Link
                  href={{
                    pathname: '/dashboard/orders/[id]/edit',
                    query: { id: order.id }
                  }}
                  as={`/dashboard/orders/${order.id}/edit`}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  <Edit className="h-5 w-5" />
                </Link>
              </PermissionGate>

              <PermissionGate permission="delete_order">
  <button
    onClick={() => handleDeleteOrder(order.id)}
    className="text-red-600 hover:text-red-900"
  >
    <Trash className="h-5 w-5" />
  </button>
</PermissionGate>

            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

interface GridViewProps {
  orders: Order[];
  handleDeleteOrder: (orderId: string | undefined) => Promise<void>;
}

const GridView = ({ orders, handleDeleteOrder }: GridViewProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {orders.map(order => (
      <div key={order.id || 'temp-' + order.title} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{order.title}</h3>
              <PriorityBadge priority={order.priority} size="sm" />
            </div>
            <p className="text-sm text-gray-500">{order.serviceType}</p>
            {/* Agregamos el análisis de IA */}
            <div className="flex flex-col space-y-1 mt-2">
              {getAIStatusBadge(order.aiAnalysis)}
              {getComplexityBadge(order.aiAnalysis)}
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fecha Entrega</span>
            <span className="text-gray-900">{order.dueDate.toLocaleDateString()}</span>
          </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <PermissionGate permission="view_orders">
            <Link
              href={{
                pathname: '/dashboard/orders/[id]',
                query: { id: order.id }
              }}
              as={`/dashboard/orders/${order.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver Detalles →
            </Link>
          </PermissionGate>
          

          <div className="flex items-center space-x-2">
            <PermissionGate permission="edit_order">
              <Link
                href={{
                  pathname: '/dashboard/orders/[id]/edit',
                  query: { id: order.id }
                }}
                as={`/dashboard/orders/${order.id}/edit`}
                className="text-yellow-600 hover:text-yellow-900"
              >
                <Edit className="h-5 w-5" />
              </Link>
            </PermissionGate>

            <PermissionGate permission="delete_order">
  <button
    onClick={() => handleDeleteOrder(order.id)}
    className="text-red-600 hover:text-red-900"
  >
    <Trash className="h-5 w-5" />
  </button>
</PermissionGate>

          </div>
        </div>
      </div>
    ))}
  </div>
);

// Actualizar GroupedOrdersView para pasar la función
interface GroupedOrdersViewProps {
  viewType: 'list' | 'grid';
  groupedOrders: Record<OrderStatus, Order[]>;
  handleDeleteOrder: (orderId: string | undefined) => Promise<void>;
}


const GroupedOrdersView = ({ 
  viewType, 
  groupedOrders,
  handleDeleteOrder 
}: GroupedOrdersViewProps) => {
  const statusTitles = {
    draft: 'Borradores',
    pending: 'Pendientes',
    in_progress: 'En Progreso',
    in_review: 'En Revisión',
    approved: 'Aprobados',
    completed: 'Completados',
    cancelled: 'Cancelados'
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedOrders).map(([status, ordersInGroup]) => (
        <div key={status} className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {statusTitles[status as OrderStatus]}
                <span className="ml-2 text-sm text-gray-500">
                  ({ordersInGroup.length})
                </span>
              </h3>
            </div>
          </div>
          <div className={viewType === 'grid' ? 'p-6' : ''}>
            {viewType === 'list' ? (
              <TableView 
                orders={ordersInGroup} 
                handleDeleteOrder={handleDeleteOrder}
              />
            ) : (
              <GridView 
                orders={ordersInGroup} 
                handleDeleteOrder={handleDeleteOrder}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function OrdersPage() {
  // Estados
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewType, setViewType] = useViewPreference('list');
  const [groupByStatus, setGroupByStatus] = useState(false);
  
  
  // Estados de filtros
  const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({
    start: null,
    end: null
  });
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all');
const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'all'>('all');
const [selectedAIStatus, setSelectedAIStatus] = useState<'pending' | 'in_progress' | 'completed' | 'all'>('all');
const [searchTerm, setSearchTerm] = useState('');



 
  // Handler seguro para borrado
  const handleDelete = async (orderId: string | undefined) => {
    if (!orderId || !user) return;
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return;
    }
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      
      const newNotification: Notification = {
        id: Math.random().toString(),
        type: 'status_change',
        message: 'Pedido eliminado correctamente',
        timestamp: new Date(),
        read: false,
        orderId
      };
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          alert('No tienes permisos para eliminar este pedido');
        } else {
          alert('Error al eliminar el pedido');
        }
      } else {
        alert('Error inesperado al eliminar el pedido');
      }
    }
  };
  
  const { user } = useAuth();

  

  // Un único useEffect para cargar pedidos
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
  
    try {
      const ordersRef = collection(db, 'orders');
      let q;
  
      if (user.role && !['admin', 'project_manager'].includes(user.role)) {
        // Para usuarios normales: usar el índice compuesto existente
        q = query(
          ordersRef,
          where('clientId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          orderBy('__name__', 'desc')
        );
      } else {
        // Para admin y project manager: solo ordenar por createdAt
        q = query(
          ordersRef,
          orderBy('createdAt', 'desc')
        );
      }
  
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
            dueDate: doc.data().dueDate.toDate(),
          })) as Order[];
          
          setOrders(ordersData);
        },
        (error) => {
          console.error('Error loading orders:', error);
        }
      );
  
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up orders listener:', error);
    }
  }, [user]);
  


  // Funciones auxiliares
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesServiceType = selectedServiceType === 'all' || order.serviceType === selectedServiceType;
      const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
      const matchesAIStatus = selectedAIStatus === 'all' || order.aiAnalysis?.status === selectedAIStatus;
      const matchesDateRange = 
        (!dateRange.start || order.createdAt >= dateRange.start) &&
        (!dateRange.end || order.createdAt <= dateRange.end);

      return matchesSearch && 
             matchesServiceType && 
             matchesPriority && 
             matchesAIStatus && 
             matchesDateRange;
    });
  }, [orders, searchTerm, selectedServiceType, selectedPriority, selectedAIStatus, dateRange]);

  // Agrupación de pedidos
  const groupedOrders = useMemo(() => {
    return filteredOrders.reduce((groups, order) => {
      const status = order.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(order);
      return groups;
    }, {} as Record<OrderStatus, Order[]>);
  }, [filteredOrders]);

  // Componente de filtros
  const FiltersPanel = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Filtro de fechas */}
        <div className="flex-1 min-w-[200px]">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
    <Search className="h-4 w-4" />
    Buscar
  </label>
  <input
    type="text"
    placeholder="Buscar pedidos..."
    className="form-input w-full rounded-md border-gray-300 text-sm"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4" />
            Rango de Fechas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="form-input rounded-md border-gray-300 text-sm"
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
            />
            <input
              type="date"
              className="form-input rounded-md border-gray-300 text-sm"
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
            />
          </div>
        </div>

        {/* Filtro por tipo de servicio */}
        <div className="flex-1 min-w-[180px]">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Layers className="h-4 w-4" />
            Tipo de Servicio
          </label>
          <select
            className="form-select w-full rounded-md border-gray-300 text-sm"
            value={selectedServiceType}
            onChange={e => setSelectedServiceType(e.target.value as ServiceType | 'all')}
          >
            <option value="all">Todos</option>
            <option value="design">Diseño</option>
            <option value="video">Video</option>
            <option value="animation">Animación</option>
            <option value="web_design">Diseño Web</option>
            <option value="web_development">Desarrollo Web</option>
          </select>
        </div>

        {/* Filtro por prioridad */}  
       <div className="flex-1 min-w-[150px]">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Flame className="h-4 w-4" />
          Prioridad
        </label>
        <div className="flex gap-2">
          <select
            className="form-select w-full rounded-md border-gray-300 text-sm"
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high' | 'all')}
          >
            <option value="all">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
          {selectedPriority !== 'all' && (
            <PriorityBadge 
              priority={selectedPriority} 
              size="sm"
              showIcon={false}
            />
          )}
        </div>
      </div>


        {/* Filtros de IA */}
        <div className="flex-1 min-w-[150px]">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Brain className="h-4 w-4" />
            Estado IA
          </label>
          <select
            className="form-select w-full rounded-md border-gray-300 text-sm"
            value={selectedAIStatus}
            onChange={e => setSelectedAIStatus(e.target.value as 'pending' | 'in_progress' | 'completed' | 'all')}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        {/* Controles de vista */}
        <div className="flex items-end justify-end gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <Switch
              checked={groupByStatus}
              onChange={setGroupByStatus}
              className={`${
                groupByStatus ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 rounded-full transition-colors`}
            >
              <span className="sr-only">Agrupar por estado</span>
              <span
                className={`${
                  groupByStatus ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className="text-sm text-gray-600">Agrupar por estado</span>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded ${
                viewType === 'list' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded ${
                viewType === 'grid' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ViewControls = () => (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
      <button
        onClick={() => setViewType('list')}
        className={`p-2 rounded transition-colors ${
          viewType === 'list' 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <List className="h-5 w-5" />
      </button>
      <button
        onClick={() => setViewType('grid')}
        className={`p-2 rounded transition-colors ${
          viewType === 'grid' 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Grid className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <RoleGate role={['admin', 'project_manager']}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                <Bell className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay notificaciones
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b hover:bg-gray-50 ${
                            !notif.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <p className="text-sm font-medium">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.timestamp.toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </RoleGate>

          {/* Vista Controls */}
          <ViewControls />

          <PermissionGate 
          permission="create_order"
          fallback={
            <button 
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              disabled
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Nuevo Pedido
            </button>
          }
        >
          <Link 
            href="/dashboard/orders/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nuevo Pedido
          </Link>
        </PermissionGate>
      </div>
    </div>

    <FiltersPanel />

    {orders.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No hay pedidos para mostrar
      </div>
    ) : (
      groupByStatus ? (
        <GroupedOrdersView 
          viewType={viewType}
          groupedOrders={groupedOrders}
          handleDeleteOrder={handleDelete}
        />
      ) : (
        <div className={viewType === 'list' ? 'bg-white rounded-lg shadow' : ''}>
          {viewType === 'list' ? (
            <TableView 
              orders={filteredOrders} 
              handleDeleteOrder={handleDelete}
            />
          ) : (
            <GridView 
              orders={filteredOrders} 
              handleDeleteOrder={handleDelete}
            />
          )}
        </div>
      )
    )}
  </div>  
);
}