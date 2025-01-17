// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { adminService } from '@/app/services/adminService';
import type { UserFilters, AdminUser } from '@/app/types/admin';
import type { UserRole } from '@/app/types/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Manejar correctamente los tipos null
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const sortByParam = searchParams.get('sortBy');
    const sortDirectionParam = searchParams.get('sortDirection');

    const filters: UserFilters = {
      role: roleParam as UserRole || undefined,
      status: statusParam as AdminUser['status'] || undefined,
      searchTerm: searchParam || undefined,
      sortBy: sortByParam as keyof AdminUser || undefined,
      sortDirection: (sortDirectionParam as 'asc' | 'desc') || undefined
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