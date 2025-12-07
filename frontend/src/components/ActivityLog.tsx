import { useEffect, useRef } from 'react';
import { type ActivityItem } from '../types';

interface ActivityLogProps {
  activities: ActivityItem[];
  currentPlayerId?: string;
}

export const ActivityLog = ({ activities = [], currentPlayerId }: ActivityLogProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new activities arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activities]);

  const getNotificationIcon = (type?: 'info' | 'success' | 'warning') => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  };

  const getNotificationColor = (type?: 'info' | 'success' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const renderActivity = (activity: ActivityItem) => {
    if (activity.type === 'chat') {
      const isCurrentUser = activity.playerId === currentPlayerId;
      return (
        <div key={activity.id} className="flex items-start gap-2 text-xs sm:text-sm">
          <span className="text-gray-400 text-xs flex-shrink-0 w-16">
            {formatTime(activity.timestamp)}
          </span>
          <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-purple-100 text-purple-800">
            💬
          </span>
          <span className="flex-1 break-words">
            <span className={`font-semibold ${isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
              {activity.playerName}:
            </span>{' '}
            <span className="text-gray-700">{activity.message}</span>
          </span>
        </div>
      );
    }

    // Notification rendering
    return (
      <div key={activity.id} className="flex items-start gap-2 text-xs sm:text-sm">
        <span className="text-gray-400 text-xs flex-shrink-0 w-16">
          {formatTime(activity.timestamp)}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${getNotificationColor(activity.notificationType)}`}
        >
          {getNotificationIcon(activity.notificationType)}
        </span>
        <span className="text-gray-700 flex-1 break-words">{activity.message}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity</h3>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {activities.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No activity yet...</div>
        ) : (
          activities.map(renderActivity)
        )}
      </div>
    </div>
  );
};
