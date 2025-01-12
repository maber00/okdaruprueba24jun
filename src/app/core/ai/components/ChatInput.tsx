// src/app/core/ai/components/ChatInput.tsx
'use client';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Loader, X } from 'lucide-react';
import NextImage from 'next/image';

interface ChatInputProps {
    inputMessage: string;
    isLoading: boolean;
    pendingReferences?: Array<{
      url: string;
      fileName: string;
      analysis?: string;
    }>; 
    onMessageChange: (message: string) => void;
    onSendMessage: () => void;
    onUploadImages: (files: File[]) => void;
    onRemoveImage: (index: number) => void;
  }

export default function ChatInput({
  inputMessage,
  isLoading,
  pendingReferences,
  onMessageChange,
  onSendMessage,
  onUploadImages,
  onRemoveImage
}: ChatInputProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onUploadImages,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 5 * 1024 * 1024
  });

  return (
    <div className="border-t bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
        {/* Área de drop y referencias */}
        <div {...getRootProps()} className="flex items-center space-x-4">
          <input {...getInputProps()} className="hidden" />
          <button
            type="button"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            <span>Agregar referencia ({(pendingReferences ?? []).length}/5)</span>
          </button>
        </div>

        {/* Imágenes pendientes */}
        {(pendingReferences ?? []).length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-3">
              {(pendingReferences ?? []).map((ref, idx) => (
                <div key={idx} className="relative group w-20 h-20">
                  <NextImage
                    src={ref.url}
                    alt={ref.fileName}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(idx);
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input y botón de envío */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || (!inputMessage.trim() && !(pendingReferences ?? []).length)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}