//src/app/api/admin/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminOnly, requirePermissions } from '@/app/middleware/withRoleCheck';
import { adminService } from '@/app/services/adminService';
import type { UserFilters, AdminUser } from '@/app/types/admin';
import type { UserRole } from '@/app/types/auth';

const adminUsersMiddleware = [
  adminOnly,
  requirePermissions(['manage_users'])
];

export async function GET(request: NextRequest) {
  try {
    // Validar permisos
    for (const middleware of adminUsersMiddleware) {
      const result = await middleware(request)
      if (result instanceof NextResponse) {
        return result
      }
    }

    const { searchParams } = request.nextUrl;
    
    const filters: UserFilters = {
      role: searchParams.get('role') as UserRole || undefined,
      status: searchParams.get('status') as AdminUser['status'] || undefined,
      searchTerm: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as keyof AdminUser || undefined,
      sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || undefined
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

export async function PATCH(request: NextRequest) {
  try {
    // Validar permisos
    for (const middleware of adminUsersMiddleware) {
      const result = await middleware(request)
      if (result instanceof NextResponse) {
        return result
      }
    }

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
export async function DELETE(request: NextRequest) {
  try {
    // Validar permisos
    for (const middleware of adminUsersMiddleware) {
      const result = await middleware(request)
      if (result instanceof NextResponse) {
        return result
      }
    }

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