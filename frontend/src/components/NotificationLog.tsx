import { useEffect, useRef } from 'react';
import { type Notification } from '../types';

interface NotificationLogProps {
  notifications: Notification[];
}

export const NotificationLog = ({ notifications = [] }: NotificationLogProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new notifications arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [notifications]);

  const getIconForType = (type: Notification['type']) => {
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

  const getColorForType = (type: Notification['type']) => {
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
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h3>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {notifications.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No activity yet...</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-2 text-xs sm:text-sm"
            >
              <span className="text-gray-400 text-xs flex-shrink-0 w-16">
                {formatTime(notification.timestamp)}
              </span>
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${getColorForType(notification.type)}`}
              >
                {getIconForType(notification.type)}
              </span>
              <span className="text-gray-700 flex-1 break-words">
                {notification.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
