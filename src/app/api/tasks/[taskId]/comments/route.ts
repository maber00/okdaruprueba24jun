// src/app/api/tasks/[taskId]/comments/route.ts
import { NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { content, userId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Crear el objeto de comentario
    const comment = {
      id: Date.now().toString(),
      content,
      userId,
      createdAt: new Date().toISOString(),
      taskId
    };

    // Actualizar el documento de la tarea con el nuevo comentario
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await updateDoc(taskRef, {
      comments: arrayUnion(comment),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string; commentId: string } }
) {
  try {
    const { taskId, commentId } = params;

    // Obtener la tarea actual
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = taskDoc.data();
    const updatedComments = task.comments.filter(
      (comment: { id: string }) => comment.id !== commentId
    );

    // Actualizar la tarea con los comentarios filtrados
    await updateDoc(taskRef, {
      comments: updatedComments,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}