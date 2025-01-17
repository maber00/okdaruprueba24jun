// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { taskService } from '@/app/services/taskService';
import { authLogger } from '@/app/lib/logger';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        authLogger.info('TasksAPI', 'Iniciando GET /api/tasks', { userId });

        if (!userId) {
            authLogger.warn('TasksAPI', 'UserId no proporcionado');
            return NextResponse.json(
                { error: 'UserId is required' },
                { status: 400 }
            );
        }

        const tasks = await taskService.getUserTasks(userId);
        
        authLogger.info('TasksAPI', 'Tareas obtenidas exitosamente', {
            count: tasks.length
        });

        return NextResponse.json(tasks);

    } catch (error) {
        authLogger.error('TasksAPI', 'Error procesando solicitud', error);
        
        // Determinar el tipo de error para una mejor respuesta
        if (error instanceof Error) {
            return NextResponse.json(
                { 
                    error: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}