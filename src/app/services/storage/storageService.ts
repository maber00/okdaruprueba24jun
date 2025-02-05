// src/app/services/storage/storageService.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/lib/firebase';

export class StorageService {
  private readonly bucketUrl = 'gs://daru-cfcd1.firebasestorage.app';

  async uploadFile(file: File, userId: string): Promise<{ url: string; fileName: string }> {
    try {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const filePath = `references/${userId}/${uniqueFileName}`;
      const storageRef = ref(storage, filePath);

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
          timestamp: timestamp.toString()
        }
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);

      return {
        url,
        fileName: file.name
      };

    } catch (error: any) {
      if (error.code === 'storage/unauthorized') {
        throw new Error('No tienes permisos para subir archivos');
      }
      if (error.code === 'storage/canceled') {
        throw new Error('La subida fue cancelada');
      }
      if (error.code === 'storage/unknown') {
        console.error('Error detallado:', error);
        throw new Error('Error al subir el archivo. Verifica tu conexión');
      }
      throw error;
    }
  }

  async uploadMultiple(files: File[], userId: string) {
    const maxConcurrent = 3;
    const results = [];
    
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const uploadPromises = batch.map(file => this.uploadFile(file, userId));
      const batchResults = await Promise.all(uploadPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Exportar una instancia por defecto
export const storageService = new StorageService();