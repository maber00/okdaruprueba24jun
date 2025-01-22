// src/app/dashboard/admin/users/components/CreateUserForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/app/shared/components/ui/Input';
import Button from '@/app/shared/components/ui/Button';
import { userManagementService } from '@/app/services/userManagementService';
import type { CreateUserDTO } from '@/app/services/userManagementService';
import type { UserRole } from '@/app/types/auth';
import { useToast } from '@/app/shared/hooks/useToast';

export function CreateUserForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: '',
    password: '',
    displayName: '',
    role: 'client',
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userManagementService.createUser(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          email: e.target.value
        }))}
        required
      />

      <Input
        type="password"
        label="Contraseña"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          password: e.target.value
        }))}
        required
      />

      <div>
      <label className="block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            role: e.target.value as UserRole
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="client">Cliente</option>
          <option value="designer">Diseñador</option>
        </select>
      </div>


      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Crear Usuario
      </Button>
    </form>
  );
}