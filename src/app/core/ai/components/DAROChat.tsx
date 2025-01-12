// src/app/core/ai/components/DAROChat.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import NextImage from 'next/image';
import { type BriefData } from '@/app/types/brief';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/app/core/ai/components/ChatInput';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/lib/firebase';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingReferences, setPendingReferences] = useState<Message['references']>([]);
  const [briefData] = useState<BriefData | null>(null); 
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !pendingReferences?.length) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      references: pendingReferences || [],
      timestamp: new Date()
    };
  
    try {
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setPendingReferences([]);
      setIsLoading(true);

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(newMessage),
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        const content = data.content;
        
        if (briefData) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date()
          }]);
        } else if (content.includes('BRIEF_COMPLETADO|')) {
          const [messageContent, briefContent] = content.split('BRIEF_COMPLETADO|');
          try {
            const briefJson = briefContent
              .split('\n')[0]
              .trim()
              .replace(/[\r\n]/g, '')
              .replace(/\s+/g, ' ')
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '');

            console.log('JSON a parsear:', briefJson);
            
            const parsedBriefData = JSON.parse(briefJson);
            onBriefComplete(parsedBriefData);
            
            if (messageContent.trim()) {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: messageContent.trim(),
                timestamp: new Date()
              }]);
            }
          } catch (error) {
            console.error('Error parsing brief:', error);
            console.error('JSON problemático:', briefContent);
          }
        } else {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImages = async (files: File[]) => {
    if (!user) return;
    
    const maxFiles = 5;
    if (pendingReferences && pendingReferences.length + files.length > maxFiles) {
      alert(`Máximo ${maxFiles} imágenes permitidas`);
      return;
    }

    setIsLoading(true);

    try {
      const newReferences = await Promise.all(files.map(async (file) => {
        const path = `references/${user.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return {
          url,
          fileName: file.name
        };
      }));

      setPendingReferences(prev => [...(prev || []), ...newReferences]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Área de mensajes */}
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
                <ReactMarkdown 
                  className="text-gray-800 prose prose-sm max-w-none"
                  components={{
                    h3: ({...props}) => <h3 className="text-lg font-bold mb-4 mt-6" {...props} />,
                    strong: ({...props}) => <span className="font-semibold text-gray-900" {...props} />,
                    p: ({...props}) => <p className="mb-4 whitespace-pre-wrap leading-relaxed" {...props} />,
                    ul: ({...props}) => <ul className="list-disc pl-4 mb-4 space-y-2" {...props} />,
                    li: ({...props}) => <li className="mb-1" {...props} />
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {message.references && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {message.references.map((ref, idx) => (
                      <div key={idx} className="relative">
                        <NextImage
                          src={ref.url}
                          alt={ref.fileName}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover shadow-sm"
                        />
                        {ref.analysis && (
                          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                            {ref.analysis}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </div>

      {/* Área de input */}
      <ChatInput
      inputMessage={inputMessage}
      isLoading={isLoading}
      pendingReferences={pendingReferences}
      onMessageChange={setInputMessage}
      onSendMessage={handleSendMessage}
      onUploadImages={handleUploadImages}
      onRemoveImage={(index: number) => {
        setPendingReferences(prev => 
          (prev ?? []).filter((_, i) => i !== index)
    );
  }}
/>

    </div>
  );
}