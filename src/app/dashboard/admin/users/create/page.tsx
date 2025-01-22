// src/app/dashboard/admin/users/create/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { userManagementService } from '@/app/services/userManagementService';
import type { UserRole } from '@/app/types/auth';
import { useToast } from '@/app/shared/hooks/useToast';

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'client' as UserRole,
    metadata: {
      company: '',
      phone: '',
      position: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userManagementService.createUser({
        ...formData
      });

      toast({
        message: 'Usuario creado exitosamente'
      });
      router.push('/dashboard/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        message: 'Error al crear usuario'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Nombre Completo"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              displayName: e.target.value
            }))}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                role: e.target.value as UserRole
              }))}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="client">Cliente</option>
              <option value="designer">Diseñador</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Información Adicional</h3>
            <div className="space-y-4">
              <Input
                label="Empresa"
                value={formData.metadata.company}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    company: e.target.value
                  }
                }))}
              />

              <Input
                label="Teléfono"
                value={formData.metadata.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    phone: e.target.value
                  }
                }))}
              />

              <Input
                label="Cargo"
                value={formData.metadata.position}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    position: e.target.value
                  }
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Crear Usuario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}