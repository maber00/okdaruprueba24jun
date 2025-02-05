// src/app/hooks/useProjectComments.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { authLogger } from '@/app/lib/logger';

interface Comment {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

export function useProjectComments(projectId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId || !db) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        authLogger.info('comments', 'Setting up comments listener', { projectId });
        
        const commentsRef = collection(db, `projects/${projectId}/comments`);
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
            })) as Comment[];

            setComments(commentsData);
            setIsLoading(false);
          },
          (error) => {
            authLogger.error('comments', 'Error in comments listener', error);
            toast({
              message: 'Error al cargar los comentarios'
            });
            setIsLoading(false);
          }
        );
      } catch (error) {
        authLogger.error('comments', 'Error setting up comments listener', error);
        toast({
          message: 'Error al configurar el listener de comentarios'
        });
        setIsLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [projectId, toast]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !projectId || !content.trim()) {
      return;
    }

    try {
      authLogger.info('comments', 'Adding new comment');
      
      const commentsRef = collection(db, `projects/${projectId}/comments`);
      await addDoc(commentsRef, {
        content,
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: serverTimestamp()
      });

      toast({
        message: 'Comentario añadido exitosamente'
      });
    } catch (error) {
      authLogger.error('comments', 'Error adding comment', error);
      toast({
        message: 'Error al añadir el comentario'
      });
    }
  }, [projectId, user, toast]);

  return {
    comments,
    isLoading,
    addComment
  };
}