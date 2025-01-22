// src/app/dashboard/projects/components/ProjectComments.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import Avatar from '@/app/shared/components/ui/Avatar';
import { Send, Reply, MoreVertical, Image, X } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  replies?: Comment[];
}

interface ProjectCommentsProps {
  projectId: string;
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const mockComments: Comment[] = [
        {
          id: '1',
          content: `Comentario del proyecto ${projectId}`,
          userId: '1',
          userName: 'Juan Pérez',
          createdAt: new Date().toISOString(),
          replies: []
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        message: 'Error al cargar los comentarios'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() && attachments.length === 0) return;

    try {
      setIsLoading(true);
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment,
        userId: user?.uid || '',
        userName: user?.displayName || '',
        createdAt: new Date().toISOString()
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      setAttachments([]);
      
      toast({
        message: 'Comentario agregado exitosamente'
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        message: 'Error al enviar el comentario'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar
          src={comment.userAvatar}
          alt={user?.displayName || 'Avatar del usuario'}
          aria-label={comment.userName || 'Avatar del usuario'}
          size={40}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{comment.userName || 'Usuario'}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          <p className="mt-2 text-gray-700">{comment.content}</p>

          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {comment.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="p-2 bg-gray-50 rounded flex items-center gap-2"
                >
                  <Image className="h-4 w-4 text-gray-400" aria-label="Icono de archivo" />
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4">
            <button
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Reply className="h-4 w-4" />
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Comentarios</h3>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}` : undefined}
              alt={user?.displayName || 'Avatar del usuario'}
              aria-label={user?.displayName || 'Avatar del usuario'}
              size={40}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded flex items-center gap-2"
                    >
                      <Image className="h-4 w-4 text-gray-400" aria-label="Icono de archivo adjunto" />
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Image className="h-4 w-4" aria-label="Icono de adjuntar archivo" />
                    Adjuntar archivos
                  </label>
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() && attachments.length === 0}
                  isLoading={isLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
