// src/app/dashboard/orders/components/OrderForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, AlertCircle } from 'lucide-react';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { type Order, type ServiceType } from '@/app/types/order';

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: Partial<Order>) => Promise<void>;
  isLoading?: boolean;
}

export default function OrderForm({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: OrderFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const data: Partial<Order> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      serviceType: formData.get('serviceType') as ServiceType,
      priority: formData.get('priority') as Order['priority'],
      dueDate: new Date(formData.get('dueDate') as string),
      // Añade más campos según sea necesario
    };

    try {
      await onSubmit(data);
      router.push('/dashboard/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el formulario');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Título del Proyecto"
          name="title"
          defaultValue={initialData?.title}
          required
          placeholder="Ej: Diseño de Logo Empresarial"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Servicio
            </label>
            <select
              name="serviceType"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue={initialData?.serviceType}
              required
            >
              <option value="">Seleccionar tipo...</option>
              <option value="design">Diseño Gráfico</option>
              <option value="video">Video</option>
              <option value="animation">Animación</option>
              <option value="web_design">Diseño Web</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              name="priority"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue={initialData?.priority}
              required
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Entrega
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="date"
              name="dueDate"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue={initialData?.dueDate?.toISOString().split('T')[0]}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={initialData?.description}
            required
          />
        </div>

        {/* Área de archivos adjuntos */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...files]);
          }}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                className="text-blue-600 hover:text-blue-500"
              >
                Sube archivos
              </button>
              {' '}o arrastra y suelta aquí
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(prev => [...prev, ...files]);
              }}
            />
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Actualizar' : 'Crear'} Pedido
        </Button>
      </div>
    </form>
  );
}
