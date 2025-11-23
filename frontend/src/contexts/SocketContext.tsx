import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinSocketRoom: (roomId: string, sessionToken: string) => void;
  addOption: (roomId: string, option: string) => void;
  removeOption: (roomId: string, option: string) => void;
  createCards: (roomId: string) => void;
  markSpace: (roomId: string, cardId: string, position: number, playerId: string) => void;
  unmarkSpace: (roomId: string, cardId: string, position: number, playerId: string) => void;
  closeRoom: (roomId: string) => void;
  getAllCards: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(WS_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed after all attempts');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinSocketRoom = (roomId: string, sessionToken: string) => {
    socket?.emit('join-room', { roomId, sessionToken });
  };

  const addOption = (roomId: string, option: string) => {
    socket?.emit('add-option', { roomId, option });
  };

  const removeOption = (roomId: string, option: string) => {
    socket?.emit('remove-option', { roomId, option });
  };

  const createCards = (roomId: string) => {
    socket?.emit('create-cards', { roomId });
  };

  const markSpace = (roomId: string, cardId: string, position: number, playerId: string) => {
    socket?.emit('mark-space', { roomId, cardId, position, playerId });
  };

  const unmarkSpace = (roomId: string, cardId: string, position: number, playerId: string) => {
    socket?.emit('unmark-space', { roomId, cardId, position, playerId });
  };

  const closeRoom = (roomId: string) => {
    socket?.emit('close-room', { roomId });
  };

  const getAllCards = (roomId: string) => {
    socket?.emit('get-all-cards', { roomId });
  };

  const value = {
    socket,
    isConnected,
    joinSocketRoom,
    addOption,
    removeOption,
    createCards,
    markSpace,
    unmarkSpace,
    closeRoom,
    getAllCards,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
