// src/app/core/notifications/services/notificationService.ts
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    addDoc, 
    updateDoc, 
    doc,
    getDocs,
    writeBatch,
    onSnapshot 
  } from 'firebase/firestore';
  import { db } from '@/app/lib/firebase';
  import type { Notification, NotificationType } from '@/app/types/notification';
  
  interface CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    recipientId: string;
    senderId?: string;
    metadata?: Notification['metadata'];
  }
  
  export const notificationService = {
    // Crear notificación
    async createNotification(data: CreateNotificationDto): Promise<string> {
      try {
        const notificationData = {
          ...data,
          read: false,
          timestamp: new Date(),
        };
  
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        return docRef.id;
      } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
    },
  
    // Marcar como leída
    async markAsRead(notificationId: string): Promise<void> {
      try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { read: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
  
    // Marcar todas como leídas
    async markAllAsRead(userId: string): Promise<void> {
      try {
        const batch = writeBatch(db);
        const q = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          where('read', '==', false)
        );
  
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((document) => {
          batch.update(document.ref, { read: true });
        });
  
        await batch.commit();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
  
    // Suscribirse a notificaciones en tiempo real
    subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
      );
  
      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
  
        callback(notifications);
      });
    }
  };