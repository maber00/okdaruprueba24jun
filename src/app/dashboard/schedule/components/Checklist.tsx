// src/app/dashboard/schedule/components/Checklist.tsx
'use client';

import { useState } from 'react';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { Card } from '@/app/shared/components/ui/card';
import { Upload, MessageSquare, Paperclip, CheckCircle, Clock, Circle } from 'lucide-react';
import type { Task } from '@/app/types/task';

interface ChecklistProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onFileUpload: (taskId: string, file: File) => void;
  onCommentAdd: (taskId: string, comment: string) => void;
}

export function Checklist({
  tasks,
  onTaskUpdate,
  onFileUpload,
  onCommentAdd
}: ChecklistProps) {
  const [commentState, setCommentState] = useState<{ [key: string]: string }>({});
  const [showCommentInput, setShowCommentInput] = useState<{ [key: string]: boolean }>({});

  const handleToggleComplete = (taskId: string) => {
    onTaskUpdate(taskId, { status: 'completed' });
  };

  const handleFileChange = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(taskId, file);
    }
  };

  const handleCommentSubmit = (taskId: string) => {
    const comment = commentState[taskId];
    if (comment?.trim()) {
      onCommentAdd(taskId, comment);
      setCommentState(prev => ({ ...prev, [taskId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getPriorityStyles = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => {
        // Definimos los valores booleanos para controlar la renderización
        const hasAttachments = task.attachments && task.attachments.length > 0;
        const hasComments = task.comments && task.comments.length > 0;

        return (
          <Card key={task.id} className={`p-4 border-2 ${getPriorityStyles(task.priority)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <h3 className="text-lg font-medium">{task.name}</h3>
              </div>
              <Button
                onClick={() => handleToggleComplete(task.id)}
                variant={task.status === 'completed' ? 'outline' : 'primary'}
                disabled={task.status === 'completed'}
              >
                {task.status === 'completed' ? 'Completada' : 'Completar'}
              </Button>
            </div>

            <p className="text-gray-600 text-sm mb-4">{task.description}</p>

            <div className="space-y-3">
              {/* Subida de archivos */}
              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(task.id, e)}
                  className="flex-1"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button variant="outline" className="shrink-0">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>

              {/* Lista de archivos */}
              {hasAttachments && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Archivos adjuntos:</h4>
                  <div className="space-y-1">
                    {task.attachments?.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Paperclip className="h-4 w-4" />
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentarios */}
              <div className="space-y-2">
                {!showCommentInput[task.id] && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCommentInput(prev => ({ ...prev, [task.id]: true }))}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Añadir Comentario
                  </Button>
                )}

                {showCommentInput[task.id] && (
                  <div className="flex gap-2">
                    <Input
                      value={commentState[task.id] || ''}
                      onChange={(e) =>
                        setCommentState(prev => ({ ...prev, [task.id]: e.target.value }))
                      }
                      placeholder="Escribe un comentario..."
                      className="flex-1"
                    />
                    <Button onClick={() => handleCommentSubmit(task.id)}>Enviar</Button>
                  </div>
                )}

                {/* Lista de comentarios */}
                {hasComments && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Comentarios:</h4>
                    <div className="space-y-2">
                      {task.comments?.map((comment, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm space-y-1">
                          <p>{comment.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}