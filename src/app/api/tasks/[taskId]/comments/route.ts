// src/app/api/tasks/[taskId]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function POST(
  req: NextRequest,
  { params }: { params: { taskId: string } } // 🔥 Cambio aquí: usar `{ params }` directamente
) {
  try {
    const { taskId } = params;
    const { content, userId } = await req.json();

    if (!content || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const comment = {
      id: Date.now().toString(),
      content,
      userId,
      createdAt: new Date().toISOString(),
      taskId
    };

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await updateDoc(taskRef, {
      comments: arrayUnion(comment),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } } // 🔥 Cambio aquí también
) {
  try {
    const { taskId } = params;
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = taskDoc.data();
    const updatedComments = task.comments?.filter(
      (comment: { id: string }) => comment.id !== commentId
    ) || [];

    await updateDoc(taskRef, {
      comments: updatedComments,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
