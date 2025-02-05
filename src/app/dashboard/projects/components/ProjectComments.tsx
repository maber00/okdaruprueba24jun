// src/app/dashboard/projects/components/ProjectComments.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import Avatar from '@/app/shared/components/ui/Avatar';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  projectId: string;
  createdAt: string;
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

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/comments`);
        if (!response.ok) {
          throw new Error('Error cargando comentarios');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({ message: 'Error al cargar comentarios' });
      }
    };

    loadComments();
  }, [projectId, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          userId: user.uid
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar comentario');
      }

      const addedComment = await response.json();
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
      toast({ message: 'Comentario agregado exitosamente' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({ message: 'Error al enviar el comentario' });
    } finally {
      setIsLoading(false);
    }
  };

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
              alt={user?.displayName || 'Avatar'}
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
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isLoading}
                  isLoading={isLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <Avatar alt="Usuario" size={40} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay comentarios aún
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}