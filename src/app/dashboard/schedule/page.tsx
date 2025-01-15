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

export default function SchedulePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
  
    useEffect(() => {
      const fetchTasks = async () => {
        if (!user) return;
  
        try {
          const response = await fetch(`/api/tasks?userId=${user.uid}`);
          if (!response.ok) throw new Error('Failed to fetch tasks');
          
          const data = await response.json();
          setTasks(data);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchTasks();
    }, [user]);
  
    const events = tasks.map((task) => ({
      id: task.id,
      title: task.name,
      start: task.startTime,
      end: task.endTime,
      backgroundColor: task.priority === 'high' 
        ? 'rgb(239 68 68)' 
        : task.priority === 'medium'
        ? 'rgb(249 115 22)'
        : 'rgb(34 197 94)',
      borderColor: task.priority === 'high'
        ? 'rgb(185 28 28)'
        : task.priority === 'medium'
        ? 'rgb(194 65 12)'
        : 'rgb(21 128 61)',
      textColor: '#ffffff'
    }));
  
    const handleEventClick = (info: EventClickArg) => {
      const task = tasks.find(t => t.id === info.event.id);
      if (task) {
        setSelectedTask(task);
      }
    };
  
    const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
  
        if (!response.ok) throw new Error('Failed to update task');
  
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ));
      } catch (error) {
        console.error('Error updating task:', error);
      }
    };
  
    const handleFileUpload = async (taskId: string, file: File) => {
      if (!user) return;
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      formData.append('userId', user.uid);
  
      try {
        const response = await fetch('/api/tasks/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) throw new Error('Failed to upload file');
  
        const newAttachment = await response.json();
        const updatedTask = tasks.find(t => t.id === taskId);
        
        if (updatedTask) {
          handleTaskUpdate(taskId, {
            attachments: [...(updatedTask.attachments || []), newAttachment]
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
  
    const handleCommentAdd = async (taskId: string, content: string) => {
      if (!user) return;
  
      try {
        const response = await fetch(`/api/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            userId: user.uid
          }),
        });
  
        if (!response.ok) throw new Error('Failed to add comment');
  
        const newComment = await response.json();
        const updatedTask = tasks.find(t => t.id === taskId);
        
        if (updatedTask) {
          handleTaskUpdate(taskId, {
            comments: [...(updatedTask.comments || []), newComment]
          });
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };
  
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      );
    }
  
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
                events={events}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay',
                }}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                editable
                eventClick={handleEventClick}
                height="auto"
                allDaySlot={false}
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
                onFileUpload={handleFileUpload}
                onCommentAdd={handleCommentAdd}
              />
            </CardContent>
          </Card>
        </div>
  
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updates) => handleTaskUpdate(selectedTask.id, updates)}
            onFileUpload={async (file: File) => handleFileUpload(selectedTask.id, file)}
            onCommentAdd={async (comment: string) => handleCommentAdd(selectedTask.id, comment)}
          />
        )}
      </div>
    );
  }