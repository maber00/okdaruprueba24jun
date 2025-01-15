// src/app/dashboard/orders/components/OrderCard.tsx
'use client';
import { Card, CardHeader, CardContent, CardFooter } from '@/app/shared/components/ui/card';
import { Eye, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import TimeRemaining from '@/app/shared/components/ui/TimeRemaining';
import PriorityBadge from '@/app/shared/components/ui/PriorityBadge';
import OrderStatusBadge from './OrderStatusBadge';
import { type Order } from '@/app/types/order';

interface OrderCardProps {
  order: Order;
  onDelete: (orderId: string) => Promise<void>;
}

export default function OrderCard({ order, onDelete }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{order.title}</h3>
            <p className="text-sm text-gray-500">{order.serviceType}</p>
          </div>
          <PriorityBadge priority={order.priority} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">{order.description}</p>
          </div>
          <div className="pt-4 border-t">
            <TimeRemaining dueDate={order.dueDate} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <OrderStatusBadge status={order.status} />
        <div className="flex space-x-2">
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
            onClick={() => order.id && onDelete(order.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash className="h-5 w-5" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}