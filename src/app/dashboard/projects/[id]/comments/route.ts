// src/app/api/projects/[Id]/comments/route.ts
import { NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { Id: string } }
) {
  try {
    const projectId = params.Id;
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error al cargar comentarios' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { Id: string } }
) {
  try {
    const projectId = params.Id;
    const { content, userId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const commentsRef = collection(db, 'comments');
    const newComment = {
      content,
      userId,
      projectId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(commentsRef, newComment);

    return NextResponse.json({
      id: docRef.id,
      ...newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Error al agregar comentario' },
      { status: 500 }
    );
  }
}