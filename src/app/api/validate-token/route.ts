// src/app/api/auth/validate-token/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await adminAuth.getUser(decodedToken.uid);

    return NextResponse.json({
      uid: user.uid,
      role: user.customClaims?.role,
      permissions: user.customClaims?.permissions || []
    });
    
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}