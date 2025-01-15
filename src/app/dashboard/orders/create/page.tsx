// src/app/dashboard/orders/create/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft,
    Calendar,
    AlertCircle,
    Upload,
    UserPlus
  } from 'lucide-react';
  
import type { ServiceType, OrderStatus, Order } from '@/app/types/order';
import { generateFileId, uploadMultipleFiles } from '@/app/lib/storage';

import { db } from '@/app/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/app/core/auth/context/AuthContext';


const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: 'design', label: 'Diseño Gráfico' },
  { value: 'video', label: 'Video' },
  { value: 'animation', label: 'Animación' },
  { value: 'web_design', label: 'Diseño Web' },
  { value: 'web_development', label: 'Desarrollo Web' }
];

export default function CreateOrderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  
    // Agregar después de los estados
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        setSelectedFiles(Array.from(files));
      }
    };
  
    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files) {
        setSelectedFiles(Array.from(files));
      }
    };

    const { user } = useAuth();
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user?.uid) return;
    
      setIsSubmitting(true);
      setError('');
    
      try {
        const formData = new FormData(e.currentTarget);
        const orderId = generateFileId();
        let fileUrls: string[] = [];
    
        if (selectedFiles.length > 0) {
          setUploadProgress(10);
          try {
            setUploadProgress(10);
            fileUrls = await uploadMultipleFiles(selectedFiles, user.uid, orderId);
            setUploadProgress(100);
           } catch (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Error al subir archivos');
           }
           
        }
    
        const orderData = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          serviceType: formData.get('serviceType') as ServiceType,
          priority: formData.get('priority') as Order['priority'],
          dueDate: new Date(formData.get('dueDate') as string),
          assignedTo: assignedUsers,
          budget: formData.get('budget') ? Number(formData.get('budget')) : null,
          tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [],
          attachments: fileUrls,
          status: 'pending' as OrderStatus,
          clientId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
    
        const ordersRef = collection(db, 'orders');
        await addDoc(ordersRef, orderData);
        router.push('/dashboard/orders');
    
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    };
    
     

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Crear Nuevo Pedido</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Información Básica</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título del Proyecto
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Diseño de Logo Empresarial"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe los detalles del proyecto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                  Tipo de Servicio
                </label>
                <select
                  name="serviceType"
                  id="serviceType"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo...</option>
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Prioridad
                </label>
                <select
                  name="priority"
                  id="priority"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Fecha de Entrega
              </label>
              <div className="mt-1 relative">
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
          {/* Team Assignment Section */}
<div className="space-y-4 pt-6 border-t">
  <h2 className="text-lg font-semibold">Asignación de Equipo</h2>
  
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Asignar a
    </label>
    <div className="mt-1 flex items-center space-x-2">
      <select
        multiple
        value={assignedUsers}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
          setAssignedUsers(selectedOptions);
        }}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="user1">Juan Diseñador</option>
        <option value="user2">María Project Manager</option>
        <option value="user3">Carlos Developer</option>
      </select>
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <UserPlus className="h-5 w-5" />
      </button>
    </div>
  </div>
</div>


        {/* Attachments Section */}
        <div className="space-y-4 pt-6 border-t">
  <h2 className="text-lg font-semibold">Archivos Adjuntos</h2>
  
  <div 
    className="border-2 border-dashed border-gray-300 rounded-lg p-6"
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleFileDrop}
  >
    <div className="flex flex-col items-center">
      <Upload className="h-8 w-8 text-gray-400" />
      <p className="mt-1 text-sm text-gray-600">
        <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
          <span>Sube archivos</span>
          <input
            type="file"
            name="attachments"
            multiple
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </label>
        {' '}o arrastra y suelta aquí
      </p>
      <p className="text-xs text-gray-500">
        PNG, JPG, PDF hasta 10MB
      </p>
    </div>
  </div>
        
        {/* File List Preview */}
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

        {/* Additional Information Section */}
        <div className="space-y-4 pt-6 border-t">
        <h2 className="text-lg font-semibold">Información Adicional</h2>
        
        <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Presupuesto (Opcional)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
                type="number"
                name="budget"
                id="budget"
                className="block w-full pl-7 pr-12 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
            </div>
        </div>
        
        <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Etiquetas (Opcional)
            </label>
            <input
            type="text"
            name="tags"
            id="tags"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: urgente, revisión, landing-page"
            />
            <p className="mt-1 text-xs text-gray-500">
            Separa las etiquetas con comas
            </p>
        </div>
        </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Subiendo archivos: {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Creando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
