// src/app/dashboard/schedule/page.tsx
'use client';
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card';
import { TaskModal } from './components/TaskModal';
import { Checklist } from './components/Checklist';
import type { Task } from '@/app/types/task';
import { useToast } from '@/app/shared/hooks/useToast';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseReady, setFirebaseReady] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Verificación de Firebase
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        if (!db) {
          console.error('Firestore not initialized');
          return;
        }
        setFirebaseReady(true);
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    checkFirebase();
  }, []);

  // Obtener tareas desde Firestore
  useEffect(() => {
    if (!isFirebaseReady || !user?.uid) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('assignedTo', 'array-contains', user.uid));
        const snapshot = await getDocs(q);

        const taskData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate?.() || new Date(),
            endTime: data.endTime?.toDate?.() || new Date(),
          };
        }) as Task[];

        taskData.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setTasks(taskData);
      } catch (error) {
        console.error('Fetch error:', error);
        toast({ message: 'Error al cargar tareas' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [isFirebaseReady, user, toast]);

  // Actualizar tarea en Firestore y el estado
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { ...updates, updatedAt: new Date().toISOString() });

      setTasks(prev =>
        prev.map(task => (task.id === taskId ? { ...task, ...updates } : task))
      );
    } catch (error) {
      console.error('Task update error:', error);
      toast({ message: 'Error al actualizar la tarea' });
    }
  };

  // Agregar comentario en Firestore y en el estado
  const handleCommentAdd = async (taskId: string, content: string) => {
    if (!user) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const newComment = {
        id: Date.now().toString(),
        content,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        taskId,
      };

      await updateDoc(taskRef, { comments: arrayUnion(newComment) });

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, comments: [...(task.comments || []), newComment] }
            : task
        )
      );
    } catch (error) {
      console.error('Comment add error:', error);
      toast({ message: 'Error al añadir el comentario' });
    }
  };

  // Manejo del evento de clic en el calendario
  const handleEventClick = (info: EventClickArg) => {
    const task = tasks.find(t => t.id === info.event.id);
    if (task) setSelectedTask(task);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mi Cronograma</h1>
        <p className="text-gray-600">Gestiona tus tareas y deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={tasks.map(task => ({
                id: task.id,
                title: task.name,
                start: task.startTime,
                end: task.endTime,
                backgroundColor:
                  task.priority === 'high'
                    ? 'rgb(239 68 68)'
                    : task.priority === 'medium'
                    ? 'rgb(249 115 22)'
                    : 'rgb(34 197 94)',
                borderColor:
                  task.priority === 'high'
                    ? 'rgb(185 28 28)'
                    : task.priority === 'medium'
                    ? 'rgb(194 65 12)'
                    : 'rgb(21 128 61)',
                textColor: '#ffffff',
              }))}
              eventClick={handleEventClick}
              locale="es"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <Checklist
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onCommentAdd={handleCommentAdd}
              onFileUpload={() => {}} // Si la funcionalidad de subida de archivos es necesaria, aquí se debe implementar
            />
          </CardContent>
        </Card>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => handleTaskUpdate(selectedTask.id, updates)}
          onCommentAdd={(comment) => handleCommentAdd(selectedTask.id, comment)}
        />
      )}
    </div>
  );
}
