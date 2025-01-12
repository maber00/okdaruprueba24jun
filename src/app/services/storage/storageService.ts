// src/app/services/storageService.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/lib/firebase';

export class StorageService {
  static async uploadReference(file: File, userId: string): Promise<string> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const path = `references/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Error al subir el archivo');
    }
  }
}