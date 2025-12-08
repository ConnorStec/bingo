export interface Room {
  id: string;
  joinCode: string;
  title: string;
  creatorId: string;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  isOpen: boolean;
  optionsPool: string[];
  players: Player[];
  createdAt: string;
  lastActivity: string;
}

export type PrePopulateMode = 'off' | 'placeholders' | 'ai_gen';

export interface Player {
  id: string;
  roomId: string;
  name: string;
  sessionToken: string;
  avatarUrl?: string;
  lastSeen: string;
  createdAt: string;
  card?: Card;
}

export interface Card {
  id: string;
  playerId: string;
  roomId: string;
  spaces: CardSpace[];
  createdAt: string;
}

export interface CardSpace {
  id: string;
  cardId: string;
  position: number;
  optionText: string; // Free spaces use 'Free Space' as the text
  isFreeSpace: boolean;
  isMarked: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'notification' | 'chat';
  timestamp: number;
  message: string;
  notificationType?: 'info' | 'success' | 'warning';
  playerId?: string;
  playerName?: string;
}
