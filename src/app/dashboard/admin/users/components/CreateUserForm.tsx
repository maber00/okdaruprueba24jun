// src/app/dashboard/admin/users/components/CreateUserForm.tsx
'use client';
import { useState } from 'react';
import Input from '@/app/shared/components/ui/Input';
import Button from '@/app/shared/components/ui/Button';
import { userManagementService } from '@/app/services/userManagementService';
import type { UserRole } from '@/app/types/auth';

export function CreateUserForm() {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'client' as UserRole,
    metadata: {
      company: '',
      phone: '',
      position: ''
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await userManagementService.createUser(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre"
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

      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            role: e.target.value as UserRole
          }))}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="client">Cliente</option>
          <option value="designer">Diseñador</option>
        </select>
      </div>

      <Button type="submit">Crear Usuario</Button>
    </form>
  );
}