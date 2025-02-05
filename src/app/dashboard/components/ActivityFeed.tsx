// src/app/dashboard/components/ActivityFeed.tsx
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import { MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';
import Avatar from '@/app/shared/components/ui/Avatar';

interface Activity {
  id: string;
  type: 'comment' | 'update' | 'complete';
  user: {
    name: string;
    avatar?: string;
  };
  project: string;
  timestamp: Date;
  message: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
      </CardHeader>
      <CardContent className="divide-y">
        {activities.map((activity) => (
          <div key={activity.id} className="py-4">
            <div className="flex space-x-3">
              <Avatar
                src={activity.user.avatar}
                alt={activity.user.name}
                size={32}
              />
              <div className="flex-1">
                <div className="flex items-center">
                  {getActivityIcon(activity.type)}
                  <div className="ml-2">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>
                      {' '}{activity.message}{' '}
                      <span className="font-medium">{activity.project}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}