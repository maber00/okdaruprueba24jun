// src/app/dashboard/orders/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/app/services/orderService';
import { useOrderFilters } from '@/app/hooks/useOrderFilters';
import OrderList from './components/OrderList';
import OrderFilters from './components/OrderFilters';
import ViewControls from './components/ViewControls';
import Button from '@/app/shared/components/ui/Button';
import { Plus } from 'lucide-react';
import type { OrderFilters as OrderFiltersType } from '@/app/types/order';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useToast } from '@/app/shared/hooks/useToast';

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { orders, isLoading, error } = useOrders();
  const { filters, setters, filteredOrders } = useOrderFilters(orders);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [groupByStatus, setGroupByStatus] = useState(false);

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId || !window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      return;
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      
      toast({
        message: 'Orden eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar la orden:', error);
      toast({
        message: 'Error al eliminar la orden'
      });
    }
  };

  const handleFilterChange = (newFilters: OrderFiltersType) => {
    setters.setSearchTerm(newFilters.searchTerm);
    setters.setServiceType(newFilters.serviceType);
    setters.setPriority(newFilters.priority);
    setters.setAIStatus(newFilters.aiStatus);
    setters.setDateRange(newFilters.dateRange);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Button onClick={() => router.push('/dashboard/orders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      <OrderFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <ViewControls
        viewType={viewType}
        onViewChange={setViewType}
        groupByStatus={groupByStatus}
        onGroupByStatusChange={setGroupByStatus}
      />

      <OrderList
        orders={filteredOrders}
        viewType={viewType}
        onDeleteOrder={handleDeleteOrder}
      />
    </div>
  );
}