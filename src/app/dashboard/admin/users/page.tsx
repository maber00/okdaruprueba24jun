// src/app/dashboard/admin/users/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { userManagementService } from '@/app/services/userManagementService';
import type { UserRole, AuthUser } from '@/app/types/auth';
import { Plus, UserCog, User, Settings } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const data = await userManagementService.getUsersByRole(selectedRole);
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedRole]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => router.push('/dashboard/admin/users/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedRole === 'client' ? 'primary' : 'outline'}
          onClick={() => setSelectedRole('client')}
        >
          <User className="h-4 w-4 mr-2" />
          Clientes
        </Button>
        <Button
          variant={selectedRole === 'designer' ? 'primary' : 'outline'}
          onClick={() => setSelectedRole('designer')}
        >
          <UserCog className="h-4 w-4 mr-2" />
          Diseñadores
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {users.map((user) => (
            <Card key={user.uid} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{user.displayName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/admin/users/${user.uid}`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
