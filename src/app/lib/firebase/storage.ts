// src/app/lib/storage.ts
import { storage } from '@/app/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Función para generar ID único
export const generateFileId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Subir un archivo
export const uploadFile = async (
  file: File,
  userId: string,
  orderId: string
): Promise<string> => {
  try {
    const filePath = `orders/${userId}/${orderId}/${generateFileId()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error al subir el archivo');
  }
};

// Subir múltiples archivos
export const uploadMultipleFiles = async (
  files: File[],
  userId: string,
  orderId: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, userId, orderId));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Error al subir los archivos');
  }
};