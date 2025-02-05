// src/app/services/notificationService.ts
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    addDoc, 
    updateDoc, 
    doc,
    onSnapshot,
    Timestamp,
    limit 
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import type { NotificationType, Notification, NotificationMetadata } from '@/app/types/notification';
import { authLogger } from '@/app/lib/logger';

class NotificationService {
    private notificationsCollection = collection(db, 'notifications');

    async createNotification(
        type: NotificationType,
        title: string,
        message: string,
        recipientId: string,
        metadata?: NotificationMetadata
    ): Promise<string> {
        try {
            const notification: Omit<Notification, 'id'> = {
                type,
                title,
                message,
                recipientId,
                metadata,
                read: false,
                timestamp: new Date(),
                senderId: metadata?.userId
            };

            const docRef = await addDoc(this.notificationsCollection, notification);
            authLogger.info('NotificationService', 'Notification created', { id: docRef.id });

            return docRef.id;
        } catch (error) {
            authLogger.error('NotificationService', 'Error creating notification', error);
            throw error;
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            const notificationRef = doc(this.notificationsCollection, notificationId);
            await updateDoc(notificationRef, { 
                read: true,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            authLogger.error('NotificationService', 'Error marking notification as read', error);
            throw error;
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        try {
            const q = query(
                this.notificationsCollection, 
                where('recipientId', '==', userId),
                where('read', '==', false)
            );

            const batch = db.batch();
            const snapshot = await db.getDocs(q);

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { 
                    read: true,
                    updatedAt: Timestamp.now()
                });
            });

            await batch.commit();
        } catch (error) {
            authLogger.error('NotificationService', 'Error marking all notifications as read', error);
            throw error;
        }
    }

    subscribeToNotifications(
        userId: string, 
        callback: (notifications: Notification[]) => void
    ): () => void {
        const q = query(
            this.notificationsCollection,
            where('recipientId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            callback(notifications);
        }, (error) => {
            authLogger.error('NotificationService', 'Error in notification subscription', error);
        });
    }

    // Métodos específicos para cada tipo de notificación
    async notifyAssignment(projectId: string, assigneeId: string, assignerId: string): Promise<string> {
        return this.createNotification(
            'assignment',
            'Nuevo Proyecto Asignado',
            'Se te ha asignado un nuevo proyecto.',
            assigneeId,
            {
                projectId,
                userId: assignerId,
                type: 'assignment'
            }
        );
    }

    async notifyStatusChange(
        projectId: string, 
        userId: string, 
        oldStatus: string, 
        newStatus: string
    ): Promise<string> {
        return this.createNotification(
            'status_change',
            'Cambio de Estado',
            `El proyecto ha cambiado de estado: ${oldStatus} → ${newStatus}`,
            userId,
            {
                projectId,
                oldStatus,
                newStatus,
                type: 'status_change'
            }
        );
    }

    async notifyDeadlineApproaching(projectId: string, userId: string, daysRemaining: number): Promise<string> {
        return this.createNotification(
            'deadline',
            'Fecha Límite Próxima',
            `Quedan ${daysRemaining} días para la entrega del proyecto.`,
            userId,
            {
                projectId,
                daysRemaining,
                type: 'deadline'
            }
        );
    }

    async notifyNewComment(projectId: string, userId: string, commentId: string): Promise<string> {
        return this.createNotification(
            'comment',
            'Nuevo Comentario',
            'Has recibido un nuevo comentario en tu proyecto.',
            userId,
            {
                projectId,
                commentId,
                type: 'comment'
            }
        );
    }

    async notifyAIUpdate(projectId: string, userId: string, updateType: string): Promise<string> {
        return this.createNotification(
            'ai_update',
            'Actualización de IA',
            'DARU ha generado nuevas sugerencias para tu proyecto.',
            userId,
            {
                projectId,
                updateType,
                type: 'ai_update'
            }
        );
    }
}

export const notificationService = new NotificationService();