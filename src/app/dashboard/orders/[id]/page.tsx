// src/app/dashboard/orders/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '@/app/types/order';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
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
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>;
  }

  if (!order) return <div>Pedido no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{order.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Detalles</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="text-sm text-gray-900">{order.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Prioridad</dt>
              <dd className="text-sm text-gray-900">{order.priority}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de entrega</dt>
              <dd className="text-sm text-gray-900">{order.dueDate.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo de servicio</dt>
              <dd className="text-sm text-gray-900">{order.serviceType}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
          <p className="text-gray-700">{order.description}</p>
        </div>

        {order.attachments && order.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Archivos adjuntos</h3>
            <ul className="space-y-2">
              {order.attachments.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Archivo {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}