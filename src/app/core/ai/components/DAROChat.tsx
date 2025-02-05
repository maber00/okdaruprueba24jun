'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import NextImage from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/app/lib/firebase';
import { type BriefData } from '@/app/types/brief';
import { ImagePlus, X, Loader } from 'lucide-react';
import Button from '@/app/shared/components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: {
    url: string;
    fileName: string;
    analysis?: string;
  }[];
  timestamp: Date;
}

interface DAROChatProps {
  onBriefComplete: (briefData: BriefData) => void;
}

export default function DAROChat({ onBriefComplete }: DAROChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingReferences, setPendingReferences] = useState<Message['references']>([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: '¡Hola! ¿En qué proyecto estás trabajando actualmente? Puedes compartir imágenes de referencia y te ayudaré a analizarlas.',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      // Verificar autenticación
      if (!auth.currentUser) {
        throw new Error('No autenticado');
      }

      // Crear una referencia segura al archivo
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `images/${auth.currentUser.uid}/${fileName}`);

      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Archivo subido correctamente:', snapshot);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL de descarga obtenida:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('Error en uploadImageToStorage:', error);
      if (error instanceof Error) {
        toast({ message: error.message });
      }
      return null;
    }
  };

  const handleUploadImages = async (files: File[]) => {
    if (!user) {
      toast({ message: 'Debes iniciar sesión para subir archivos' });
      return;
    }

    setIsLoading(true);
    const maxFiles = 5;

    try {
      if ((pendingReferences?.length || 0) + files.length > maxFiles) {
        toast({ message: `Máximo ${maxFiles} archivos permitidos` });
        return;
      }

      const newReferences = await Promise.all(
        files.map(async (file) => {
          const url = await uploadImageToStorage(file);
          if (!url) return null;
          return {
            url,
            fileName: file.name
          };
        })
      );

      const validReferences = newReferences.filter((ref): ref is NonNullable<typeof ref> => ref !== null);

      if (validReferences.length > 0) {
        setPendingReferences(prev => [...(prev || []), ...validReferences]);
        toast({ message: 'Archivos subidos correctamente' });
      }
    } catch (error) {
      console.error('Error en handleUploadImages:', error);
      toast({ message: 'Error al subir los archivos' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && (!pendingReferences || pendingReferences.length === 0)) {
      return;
    }

    try {
      setIsLoading(true);
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        references: pendingReferences,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setPendingReferences([]);

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(newMessage)
        }),
      });

      const data = await response.json();

      if (data.success) {
        const content = data.content;
        if (content.includes('BRIEF_COMPLETADO|')) {
          const [messageContent, briefContent] = content.split('BRIEF_COMPLETADO|');
          const briefData = JSON.parse(briefContent);
          onBriefComplete(briefData);
          
          if (messageContent.trim()) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: messageContent.trim(),
              timestamp: new Date()
            }]);
          }
        } else {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Error en handleSendMessage:', error);
      toast({ message: 'Error al enviar el mensaje' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-lg p-6 ${
                message.role === 'user' ? 'bg-gray-200' : 'bg-white shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.references && message.references.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {message.references.map((ref, idx) => (
                      <div key={idx} className="relative">
                        <NextImage
                          src={ref.url}
                          alt={ref.fileName}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer">
              <ImagePlus className="h-5 w-5" />
              <span>Agregar referencia ({(pendingReferences || []).length}/5)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadImages(Array.from(e.target.files));
                  }
                }}
              />
            </label>
          </div>

          {pendingReferences && pendingReferences.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
              {pendingReferences.map((ref, idx) => (
                <div key={idx} className="relative group">
                  <div className="w-20 h-20 relative">
                    <NextImage
                      src={ref.url}
                      alt={ref.fileName}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPendingReferences(prev => 
                        prev ? prev.filter((_, i) => i !== idx) : []
                      );
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            disabled={isLoading}
            suppressHydrationWarning // Add this prop
          />


            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputMessage.trim() && (!pendingReferences || pendingReferences.length === 0))}
            >
              {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}