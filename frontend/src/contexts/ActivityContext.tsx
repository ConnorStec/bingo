import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type ActivityItem, type ChatMessage } from '../types';

interface ActivityContextType {
  activities: ActivityItem[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warning') => void;
  addChatMessage: (chatMessage: ChatMessage) => void;
  loadChatHistory: (chatHistory: ChatMessage[]) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const activity: ActivityItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'notification',
      timestamp: Date.now(),
      notificationType: type,
      message,
    };

    setActivities((prev) => [activity, ...prev]);
  }, []);

  const addChatMessage = useCallback((chatMessage: ChatMessage) => {
    const activity: ActivityItem = {
      id: `chat-${chatMessage.id}`,
      type: 'chat',
      timestamp: new Date(chatMessage.createdAt).getTime(),
      message: chatMessage.message,
      playerId: chatMessage.playerId,
      playerName: chatMessage.playerName,
    };

    setActivities((prev) => [activity, ...prev]);
  }, []);

  const loadChatHistory = useCallback((chatHistory: ChatMessage[]) => {
    const chatActivities: ActivityItem[] = chatHistory.map((msg) => ({
      id: `chat-${msg.id}`,
      type: 'chat' as const,
      timestamp: new Date(msg.createdAt).getTime(),
      message: msg.message,
      playerId: msg.playerId,
      playerName: msg.playerName,
    }));

    // Merge with existing notifications, sort by timestamp descending (newest first)
    setActivities((prev) => {
      const existingNotifications = prev.filter((a) => a.type === 'notification');
      const merged = [...existingNotifications, ...chatActivities];
      return merged.sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const value = {
    activities,
    addNotification,
    addChatMessage,
    loadChatHistory,
    clearActivities,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};
