// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { adminService } from '@/app/services/adminService';
import type { UserFilters, AdminUser } from '@/app/types/admin';
import type { UserRole } from '@/app/types/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: UserFilters = {
      role: searchParams.get('role') as UserRole,
      status: searchParams.get('status') as AdminUser['status'],
      searchTerm: searchParams.get('search'),
      sortBy: searchParams.get('sortBy') as keyof AdminUser,
      sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc'
    };
    const page = parseInt(searchParams.get('page') || '1');

    const result = await adminService.getUsers(filters, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, updates } = await request.json();
    
    if (updates.role) {
      await adminService.updateUserRole(userId, updates.role);
    }
    
    if (updates.status) {
      await adminService.updateUserStatus(userId, updates.status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    await adminService.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}