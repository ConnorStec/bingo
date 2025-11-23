export interface Room {
  id: string;
  joinCode: string;
  creatorId: string;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  isOpen: boolean;
  optionsPool: string[];
  players: Player[];
  createdAt: string;
  lastActivity: string;
}

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
  optionText: string | null;
  isFreeSpace: boolean;
  isMarked: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
}
