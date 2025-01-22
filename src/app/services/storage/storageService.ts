// src/app/services/storageService.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/lib/firebase';

export class StorageService {
  static async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async uploadReference(file: File, userId: string): Promise<string> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const path = `references/${userId}/${Date.now()}-${file.name}`;
    return await this.uploadFile(file, path);
  }
}