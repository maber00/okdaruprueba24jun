// src/app/dashboard/orders/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import OrderDetails from '../components/OrderDetails';
import { type Order, type OrderStatus } from '@/app/types/order';
import { useAuth } from '@/app/core/auth/hooks/useAuth';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return;

      try {
        const orderRef = doc(db, 'orders', params.id as string);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...orderSnap.data(),
            createdAt: orderSnap.data().createdAt.toDate(),
            updatedAt: orderSnap.data().updatedAt.toDate(),
            dueDate: orderSnap.data().dueDate.toDate()
          } as Order);
        } else {
          setError('Orden no encontrada');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error al cargar la orden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order?.id || !user) return;

    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      setOrder(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date()
      } : null);

    } catch (err) {
      console.error('Error updating order status:', err);
      throw new Error('Error al actualizar el estado');
    }
  };

  const handleDelete = async () => {
    if (!order?.id || !user) return;

    try {
      const orderRef = doc(db, 'orders', order.id);
      await deleteDoc(orderRef);
      router.push('/dashboard/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
      throw new Error('Error al eliminar la orden');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <OrderDetails
        order={order}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}