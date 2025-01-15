// src/app/dashboard/orders/components/OrderList.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash } from 'lucide-react';
import TimeRemaining from '@/app/shared/components/ui/TimeRemaining';
import PriorityBadge from '@/app/shared/components/ui/PriorityBadge';
import OrderStatusBadge from './OrderStatusBadge';
import OrderCard from './OrderCard';
import { type Order } from '@/app/types/order';

interface OrderListProps {
  orders: Order[];
  onDeleteOrder: (orderId: string) => Promise<void>;
  viewType: 'grid' | 'list';
}

type SortableFields = 'createdAt' | 'dueDate' | 'title' | 'priority';

export default function OrderList({ orders, onDeleteOrder, viewType }: OrderListProps) {
  const [sortBy] = useState<SortableFields>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedOrders = [...orders].sort((a, b) => {
    // Manejar campos de fecha
    if (sortBy === 'createdAt' || sortBy === 'dueDate') {
      const aDate = a[sortBy].getTime();
      const bDate = b[sortBy].getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    // Manejar campos de texto
    if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    // Manejar prioridad
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityValues[a.priority] || 0;
      const bPriority = priorityValues[b.priority] || 0;
      return sortOrder === 'asc' ? aPriority - bPriority : bPriority - aPriority;
    }

    return 0;
  });

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Título
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prioridad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Entrega
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOrders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{order.title}</div>
                <div className="text-sm text-gray-500">{order.serviceType}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityBadge priority={order.priority} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TimeRemaining dueDate={order.dueDate} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Link 
                    href={`/dashboard/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link
                    href={`/dashboard/orders/${order.id}/edit`}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => order.id && onDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedOrders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onDelete={onDeleteOrder}
        />
      ))}
    </div>
  );

  return viewType === 'grid' ? renderGridView() : renderTableView();
}