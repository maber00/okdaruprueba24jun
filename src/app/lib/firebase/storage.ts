import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './index';

/**
 * Servicio para manejar operaciones en Firebase Storage.
 */
export class StorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  getDownloadUrl(path: string): Promise<string> {
    return getDownloadURL(ref(storage, path));
  }
}

/**
 * Genera un ID único basado en la marca de tiempo y un valor aleatorio.
 */
export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sube múltiples archivos a Firebase Storage y retorna las URLs de descarga.
 * @param files Lista de archivos a subir.
 * @param userId ID del usuario que sube los archivos.
 * @param orderId ID del pedido al que están asociados los archivos.
 * @returns Lista de URLs de descarga de los archivos subidos.
 */
export async function uploadMultipleFiles(
  files: File[],
  userId: string,
  orderId: string
): Promise<string[]> {
  const storageService = new StorageService();
  const fileUrls: string[] = [];

  for (const file of files) {
    const path = `orders/${userId}/${orderId}/${generateFileId()}-${file.name}`;
    const fileUrl = await storageService.uploadFile(file, path);
    fileUrls.push(fileUrl);
  }

  return fileUrls;
}

// Exporta una instancia del servicio.
export const storageService = new StorageService();
