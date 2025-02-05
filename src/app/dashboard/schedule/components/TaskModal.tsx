// src/app/dashboard/schedule/components/TaskModal.ts
'use client';
import { useState } from 'react';
import Input from '@/app/shared/components/ui/Input';
import Button from '@/app/shared/components/ui/Button';
import { MessageSquare, X, Check, Upload, Paperclip } from 'lucide-react';
import type { Task } from '@/app/types/task';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onCommentAdd: (comment: string) => void;
  onFileUpload: (taskId: string, file: File) => void;
}

export function TaskModal({ task, onClose, onUpdate, onCommentAdd, onFileUpload }: TaskModalProps) {
  console.log('TaskModal rendered:', { taskId: task.id });

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = async (status: Task['status']) => {
    console.log('Status change requested:', { oldStatus: task.status, newStatus: status });
    try {
      setIsSubmitting(true);
      await onUpdate({ status });
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    console.log('Comment submission requested:', { comment });
    if (!comment.trim() || isSubmitting) {
      console.log('Comment submission skipped:', { isEmpty: !comment.trim(), isSubmitting });
      return;
    }

    try {
      setIsSubmitting(true);
      await onCommentAdd(comment);
      console.log('Comment added successfully');
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(task.id, file);
    }
  };

  console.log('TaskModal current state:', {
    comment,
    isSubmitting,
    taskStatus: task.status,
    commentsCount: task.comments?.length,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{task.name}</h2>
          <button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Estado</h3>
            <div className="flex gap-2">
              {['pending', 'in_progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as Task['status'])}
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.status === status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status === 'pending' ? 'Pendiente' : status === 'in_progress' ? 'En Proceso' : 'Completado'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Descripción</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          {/* Subida de archivos */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Archivos Adjuntos</h3>
            <div className="flex gap-2">
              <Input type="file" onChange={handleFileChange} className="flex-1" accept="image/*,.pdf,.doc,.docx" />
              <Button variant="outline" className="shrink-0">
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de archivos */}
            {task.attachments?.length > 0 && (
              <div className="mt-2 space-y-1">
                {task.attachments.map((attachment, index) => (
                  <a
                    key={index}
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
            )}
          </div>

          {/* Comentarios */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Comentarios</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {task.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={comment}
                onChange={(e) => {
                  console.log('Comment input changed:', e.target.value);
                  setComment(e.target.value);
                }}
                placeholder="Escribe un comentario..."
                className="flex-1"
              />
              <Button onClick={handleCommentSubmit} disabled={isSubmitting || !comment.trim()}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
