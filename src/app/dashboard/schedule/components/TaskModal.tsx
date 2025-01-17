// src/app/dashboard/schedule/components/TaskModal.tsx
import { useState } from 'react';
import Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';
import { 
  MessageSquare,
  Paperclip,
  X,
  Upload
} from 'lucide-react';
import type { Task } from '@/app/types/task';

export interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onFileUpload: (file: File) => Promise<void>;
  onCommentAdd: (comment: string) => Promise<void>;
}

export function TaskModal({ 
  task, 
  onClose, 
  onUpdate,
  onFileUpload,
  onCommentAdd 
}: TaskModalProps) {
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (newFile) {
      setFile(newFile);
      await onFileUpload(newFile);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    await onCommentAdd(comment);
    setComment('');
  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">{task.name}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="space-y-6">
      {/* Detalles de la tarea */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
        <div>
          <span className="text-gray-600">Inicio:</span>
          <p>{new Date(task.startTime).toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-600">Fin:</span>
          <p>{new Date(task.endTime).toLocaleString()}</p>
        </div>
      </div>

      {/* Estado y Prioridad */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          task.status === 'completed' ? 'bg-green-100 text-green-800' :
          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Descripción */}
      <div>
        <h3 className="font-medium mb-2">Descripción</h3>
        <p className="text-gray-600">{task.description}</p>
      </div>

      {/* Subir archivo */}
      <div>
        <h3 className="font-medium mb-2">Subir Archivo</h3>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button onClick={() => file && onFileUpload(file)} disabled={!file}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comentarios */}
      <div>
        <h3 className="font-medium mb-2">Comentarios</h3>
        <div className="space-y-2 mb-4">
          {task.comments?.map((comment, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded">
              <p className="text-sm">{comment.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añade un comentario..."
            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
          />
          <Button onClick={handleCommentSubmit}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentar
          </Button>
        </div>
      </div>

      {/* Archivos adjuntos */}
      {task.attachments?.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Archivos</h3>
          <div className="space-y-2">
            {task.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <a 
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {attachment.fileName}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actualización de tarea */}
      <div>
        <h3 className="font-medium mb-2">Actualizar Tarea</h3>
        <div className="space-y-4">
          <Input
            value={task.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Actualizar nombre de la tarea"
          />
          <Input
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Actualizar descripción"
          />
        </div>
      </div>
    </div>
  </div>
</div>
  );
}