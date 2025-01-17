// src/app/lib/session.ts
import { cookies } from 'next/headers';
import { authLogger } from '@/app/lib/logger';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get('session');
  
    if (!sessionCookie) {
      return null;
    }

    const response = await fetch('/api/auth/check-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session: sessionCookie.value }),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    authLogger.error('getSession', 'Error obteniendo sesión', error);
    return null;
  }
}