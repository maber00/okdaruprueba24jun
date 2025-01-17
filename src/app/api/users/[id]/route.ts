// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase/admin';
import { authLogger } from '@/app/lib/logger'; // Importamos el logger

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userDoc = await adminDb
      .collection('users')
      .doc(params.id)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    // Utilizamos el error en el logger antes de retornar la respuesta
    authLogger.error('getUserById', 'Error al obtener usuario', error);

    return NextResponse.json(
      { error: 'Error al obtener usuario' }, 
      { status: 500 }
    );
  }
}