'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ImagePlus, Loader, X } from 'lucide-react';
import Image from 'next/image';

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
  pendingReferences = [],
  onMessageChange,
  onSendMessage,
  onUploadImages,
  onRemoveImage
}: ChatInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust textarea height
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Auto-adjust height on content change
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // Handle file drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      onUploadImages(droppedFiles);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUploadImages(files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="border-t bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
        {/* Drop zone and file input */}
        <div 
          className={`relative border-2 border-dashed rounded-lg p-4 transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
            id="file-input"
          />
          <label 
            htmlFor="file-input"
            className="flex items-center justify-center cursor-pointer"
          >
            <ImagePlus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Agregar referencia ({pendingReferences.length}/5)
            </span>
          </label>
        </div>

        {/* Pending images preview */}
        {pendingReferences.length > 0 && (
          <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
            {pendingReferences.map((ref, idx) => (
              <div key={idx} className="relative group">
                <div className="w-20 h-20 relative">
                  <Image
                    src={ref.url}
                    alt={ref.fileName}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <button
                  onClick={() => onRemoveImage(idx)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input and send button */}
        <div className="flex items-end gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                onMessageChange(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Escribe un mensaje..."
              className="w-full resize-none overflow-y-hidden rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all min-h-[44px] max-h-32"
              disabled={isLoading}
              style={{ height: textareaHeight }}
              suppressHydrationWarning
            />
          </div>

          <button
            onClick={onSendMessage}
            disabled={isLoading || (!inputMessage.trim() && pendingReferences.length === 0)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center min-w-[100px] h-[44px]"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}