import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import { Bell } from 'lucide-react';
import { notificationService } from '@/app/core/notifications/services/notificationService';
import type { Notification } from '@/app/types/notification';
import { useAuth } from '@/app/core/auth/hooks/useAuth';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Notificaciones</h2>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Marcar todas como leídas
          </button>
        )}
      </CardHeader>
      <CardContent className="divide-y max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`py-4 ${!notification.read ? 'bg-blue-50' : ''}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}