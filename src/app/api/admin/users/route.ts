// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { adminService } from '@/app/services/adminService';
import type { UserFilters } from '@/app/types/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: UserFilters = {
      role: searchParams.get('role') as UserRole || undefined,
      status: searchParams.get('status') as AdminUser['status'] || undefined,
      searchTerm: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as keyof AdminUser || undefined,
      sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' || undefined
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

// src/app/api/admin/stats/route.ts
export async function GET(request: Request) {
  try {
    const stats = await adminService.getUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}