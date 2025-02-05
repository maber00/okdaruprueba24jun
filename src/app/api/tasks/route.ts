// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { authLogger } from '@/app/lib/logger';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 401 }
      );
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('assignedTo', 'array-contains', userId),
      orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    authLogger.error('getTasks', 'Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}