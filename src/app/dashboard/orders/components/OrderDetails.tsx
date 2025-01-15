// src/app/dashboard/orders/components/OrderDetails.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Clock,
  Download,
  Edit,
  Brain,
  Trash
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import TimeRemaining from '@/app/shared/components/ui/TimeRemaining';
import PriorityBadge from '@/app/shared/components/ui/PriorityBadge';
import Avatar from '@/app/shared/components/ui/Avatar';
import Button from '@/app/shared/components/ui/Button';
import { type Order, type OrderStatus } from '@/app/types/order';

interface OrderDetailsProps {
  order: Order;
  onStatusChange?: (newStatus: OrderStatus) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function OrderDetails({ 
  order, 
  onStatusChange,
  onDelete 
}: OrderDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    in_review: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!onStatusChange) return;
    
    try {
      setIsChangingStatus(true);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) return;
    
    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/orders"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{order.title}</h1>
            <p className="text-gray-500">Creado el {order.createdAt.toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/orders/${order.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
          
          {onDelete && (
            <Button
              variant="secondary"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Estado y Prioridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Estado</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                {order.status}
              </div>
              
              {onStatusChange && (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={isChangingStatus}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="in_review">En Revisión</option>
                  <option value="approved">Aprobado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Prioridad y Tiempo</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <PriorityBadge priority={order.priority} />
              <div className="flex items-center mt-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <TimeRemaining dueDate={order.dueDate} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
  <CardHeader>
    <h2 className="text-lg font-semibold">Asignado a</h2>
  </CardHeader>
  <CardContent>
    <div className="flex">
      {order.assignedTo.map((userId, index) => (
        <div 
          key={userId} 
          className="-mr-2 first:ml-0"
        >
          <div className="border-2 border-white rounded-full">
            <Avatar
              alt={`Usuario ${index + 1}`}
              size={32}
              className="shadow-sm"
            />
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
      </div>

      {/* Detalles y Archivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Detalles del Proyecto</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                <p className="mt-1 text-gray-900">{order.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de Servicio</h3>
                <p className="mt-1 text-gray-900">{order.serviceType}</p>
              </div>

              {order.budget && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Presupuesto</h3>
                  <p className="mt-1 text-gray-900">${order.budget.toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Archivos Adjuntos</h2>
          </CardHeader>
          <CardContent>
            {order.attachments && order.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {order.attachments.map((url, index) => (
                  <div 
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <Image
                        src={url}
                        alt={`Adjunto ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a
                        href={url}
                        download
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay archivos adjuntos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análisis de IA */}
      {order.aiAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Análisis de IA</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  order.aiAnalysis.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.aiAnalysis.status === 'completed' ? 'Análisis Completado' : 'En Proceso'}
                </span>
              </div>

              {order.aiAnalysis.suggestions && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Sugerencias</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {order.aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-900">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}