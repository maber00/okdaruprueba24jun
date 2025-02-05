import { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  UserPlus,
  RefreshCw,
  Clock,
  MessageSquare,
  Brain
} from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  CardFooter 
} from '@/app/shared/components/ui/card';
import  Button  from '@/app/shared/components/ui/Button';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { notificationService } from '@/app/services/notificationService';
import type { Notification } from '@/app/types/notification';
import Avatar from '@/app/shared/components/ui/Avatar';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
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
    if (!user?.uid) return;
    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
      case 'assignment':
        return <UserPlus className={`${iconClasses} text-blue-500`} />;
      case 'status_change':
        return <RefreshCw className={`${iconClasses} text-yellow-500`} />;
      case 'deadline':
        return <Clock className={`${iconClasses} text-red-500`} />;
      case 'comment':
        return <MessageSquare className={`${iconClasses} text-green-500`} />;
      case 'ai_update':
        return <Brain className={`${iconClasses} text-purple-500`} />;
      default:
        return <Bell className={`${iconClasses} text-gray-500`} />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[calc(100vh-100px)] flex flex-col z-50">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Marcar todo como leído
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 hover:bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </div>
                    {notification.metadata?.projectId && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Ver proyecto
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-gray-900"
              onClick={() => {/* Navegar a todas las notificaciones */}}
            >
              Ver todas las notificaciones
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}