// src/app/api/tasks/upload/route.ts
import { NextResponse } from 'next/server';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  getDoc 
} from 'firebase/firestore';
import { storage, db } from '@/app/lib/firebase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !taskId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generar un nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `tasks/${taskId}/attachments/${fileName}`;

    // Subir el archivo a Firebase Storage
    const fileBuffer = await file.arrayBuffer();
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, fileBuffer);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef);

    // Crear el objeto de adjunto
    const attachment = {
      id: fileName,
      fileName: file.name,
      fileUrl: downloadURL,
      fileType: file.type,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      taskId
    };

    // Actualizar el documento de la tarea con el nuevo adjunto
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      attachments: arrayUnion(attachment),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string; fileId: string } }
) {
  try {
    const { taskId, fileId } = params;

    // Eliminar el archivo de Firebase Storage
    const filePath = `tasks/${taskId}/attachments/${fileId}`;
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    // Actualizar el documento de la tarea
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = taskDoc.data();
    const updatedAttachments = task.attachments.filter(
      (att: { id: string }) => att.id !== fileId
    );

    await updateDoc(taskRef, {
      attachments: updatedAttachments,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}