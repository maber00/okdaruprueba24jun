// src/app/dashboard/admin/users/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/shared/components/ui/Button';
import { Card } from '@/app/shared/components/ui/card';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';

export default function UsersPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/admin/users/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>
    </div>
  );
}