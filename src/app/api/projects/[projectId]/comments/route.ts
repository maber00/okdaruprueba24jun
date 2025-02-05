// src/app/api/projects/[projectId]/comments/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';
import { collection, getDocs, addDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // ✅ Obtener token desde la cabecera Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // ✅ Verificar token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // ✅ Obtener comentarios desde Firestore
    const commentsRef = collection(db, `projects/${params.projectId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString()
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
  { params }: { params: { projectId: string } }
) {
  try {
    // ✅ Verificar token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // ✅ Guardar comentario en Firestore
    const commentsRef = collection(db, `projects/${params.projectId}/comments`);
    const newComment = {
      content,
      userId: decodedToken.uid,
      projectId: params.projectId,
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
