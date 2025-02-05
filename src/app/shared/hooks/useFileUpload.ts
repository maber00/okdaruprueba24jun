// src/app/shared/hooks/useFileUpload.ts
import { useState } from 'react';
import { storageService } from '@/app/services/storage/storageService';
import { useToast } from '@/app/shared/hooks/useToast';
import { useAuth } from '@/app/core/auth/hooks/useAuth';

interface UploadOptions {
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
  metadata?: Record<string, string>;
  path?: string;
}

interface UploadResult {
  urls: string[];
  error?: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadFiles = async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    if (!user) {
      return { urls: [], error: 'Usuario no autenticado' };
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Construir path base
      const basePath = options.path || `uploads/${user.uid}/${Date.now()}`;

      // Subir archivos
      const urls = await storageService.uploadMultiple(files, basePath, {
        maxFiles: options.maxFiles,
        maxSize: options.maxSize,
        allowedTypes: options.allowedTypes
      });

      setProgress(100);
      toast({ message: 'Archivos subidos exitosamente' });

      return { urls };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivos';
      toast({ message: errorMessage });
      return { urls: [], error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<string | null> => {
    if (!user) {
      toast({ message: 'Usuario no autenticado' });
      return null;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Construir path
      const path = options.path || 
        `uploads/${user.uid}/${Date.now()}-${storageService.generateUniqueFilename(file.name)}`;

      // Subir archivo
      const url = await storageService.uploadFile(file, path, {
        maxSize: options.maxSize,
        allowedTypes: options.allowedTypes,
        metadata: options.metadata
      });

      setProgress(100);
      toast({ message: 'Archivo subido exitosamente' });

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';
      toast({ message: errorMessage });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    progress
  };
}