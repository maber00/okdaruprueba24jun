// src/app/middleware/withRoleCheck.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/app/types/auth';
import { auth } from '@/app/lib/firebase';

export function withRoleCheck(allowedRoles: UserRole[]) {
  return async function middleware(request: NextRequest) {
    try {
      const session = await auth.currentUser;
      
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const userDoc = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.uid}`);
      const userData = await userDoc.json();

      if (!userData || !allowedRoles.includes(userData.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Role check error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  };
}