import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { sessionStorage } from '../services/session';
import { useSocket } from '../contexts/SocketContext';
import { useActivity } from '../contexts/ActivityContext';
import { type Room as RoomType, type Player, type CardSpace, type ChatMessage } from '../types';
import { Lobby } from '../components/Lobby';
import { GameBoard } from '../components/GameBoard';
import { AllCardsView } from '../components/AllCardsView';
import { ConnectionStatus } from '../components/ConnectionStatus';

interface PlayerCard {
  id: string;
  playerId: string;
  playerName: string;
  spaces: CardSpace[];
}

export const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, joinSocketRoom, getAllCards } = useSocket();
  const { addNotification, addChatMessage, loadChatHistory, activities } = useActivity();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllCards, setShowAllCards] = useState(false);
  const [allCards, setAllCards] = useState<PlayerCard[]>([]);

  useEffect(() => {
    const session = sessionStorage.get();
    if (!session || session.roomId !== roomId) {
      navigate('/');
      return;
    }

    // Load room data
    const loadRoom = async () => {
      try {
        const roomData = await api.getRoom(roomId!);
        setRoom(roomData);

        const player = roomData.players.find((p: Player) => p.id === session.playerId);
        setCurrentPlayer(player || null);

        // Join socket room
        joinSocketRoom(roomId!, session.sessionToken);
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, navigate, joinSocketRoom]);

  // Store latest room state in ref to avoid re-registering socket listeners
  const roomRef = useRef(room);
  roomRef.current = room;

  // Store currentPlayer ID in ref
  const currentPlayerIdRef = useRef(currentPlayer?.id);
  currentPlayerIdRef.current = currentPlayer?.id;

  // Stable callback to refresh room data
  const refreshRoom = useCallback(async () => {
    try {
      const roomData = await api.getRoom(roomId!);
      setRoom(roomData);
      const player = roomData.players.find((p: Player) => p.id === currentPlayerIdRef.current);
      setCurrentPlayer(player || null);
    } catch (error) {
      // Silently fail - room might be temporarily unavailable
    }
  }, [roomId]);

  // Setup socket listeners - only re-register when socket changes, not when room changes
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      addNotification('Connected to server', 'success');
    };

    const handleDisconnect = () => {
      addNotification('Disconnected from server', 'warning');
    };

    const handleReconnect = () => {
      addNotification('Reconnected successfully!', 'success');
      refreshRoom();
    };

    const handlePlayerJoined = (data: { name: string }) => {
      addNotification(`${data.name} joined the room`, 'info');
      refreshRoom();
    };

    const handleOptionAdded = (data: { option: string }) => {
      setRoom((prev) =>
        prev ? { ...prev, optionsPool: [...prev.optionsPool, data.option] } : prev
      );
    };

    const handleOptionRemoved = (data: { option: string }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, optionsPool: prev.optionsPool.filter((opt) => opt !== data.option) }
          : prev
      );
    };

    const handleCardsCreated = () => {
      addNotification('Cards have been created! Game starting...', 'success');
      refreshRoom();
    };

    const handleSpaceMarked = (data: { playerId: string; optionText: string }) => {
      const player = roomRef.current?.players.find((p) => p.id === data.playerId);
      const playerName = player?.name || 'A player';
      addNotification(`${playerName} marked: ${data.optionText}`, 'info');
      refreshRoom();
    };

    const handleSpaceUnmarked = (data: { playerId: string; optionText: string }) => {
      const player = roomRef.current?.players.find((p) => p.id === data.playerId);
      const playerName = player?.name || 'A player';
      addNotification(`${playerName} unmarked: ${data.optionText}`, 'info');
      refreshRoom();
    };

    const handlePlayerWon = (data: { name: string }) => {
      addNotification(`${data.name} got BINGO!`, 'success');
    };

    const handleRoomClosed = () => {
      addNotification('Room has been closed to new players', 'info');
      setRoom((prev) => (prev ? { ...prev, isOpen: false } : prev));
    };

    const handleGameState = (data: RoomType & { chatHistory?: ChatMessage[] }) => {
      setRoom(data);
      const player = data.players.find((p: Player) => p.id === currentPlayerIdRef.current);
      setCurrentPlayer(player || null);

      // Load chat history if present
      if (data.chatHistory) {
        loadChatHistory(data.chatHistory);
      }
    };

    const handleChatMessage = (data: ChatMessage) => {
      addChatMessage(data);
    };

    const handleError = (data: { message: string }) => {
      addNotification(data.message, 'warning');
    };

    const handleAllCards = (data: { cards: PlayerCard[] }) => {
      setAllCards(data.cards);
      setShowAllCards(true);
    };

    // Register all listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('option-added', handleOptionAdded);
    socket.on('option-removed', handleOptionRemoved);
    socket.on('cards-created', handleCardsCreated);
    socket.on('space-marked', handleSpaceMarked);
    socket.on('space-unmarked', handleSpaceUnmarked);
    socket.on('player-won', handlePlayerWon);
    socket.on('room-closed', handleRoomClosed);
    socket.on('game-state', handleGameState);
    socket.on('chat-message', handleChatMessage);
    socket.on('error', handleError);
    socket.on('all-cards', handleAllCards);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('option-added', handleOptionAdded);
      socket.off('option-removed', handleOptionRemoved);
      socket.off('cards-created', handleCardsCreated);
      socket.off('space-marked', handleSpaceMarked);
      socket.off('space-unmarked', handleSpaceUnmarked);
      socket.off('player-won', handlePlayerWon);
      socket.off('room-closed', handleRoomClosed);
      socket.off('game-state', handleGameState);
      socket.off('chat-message', handleChatMessage);
      socket.off('error', handleError);
      socket.off('all-cards', handleAllCards);
    };
  }, [socket, addNotification, addChatMessage, loadChatHistory, refreshRoom]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!room || !currentPlayer) {
    return null;
  }

  const handleViewAllCards = () => {
    getAllCards(roomId!);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ConnectionStatus />
      {room.status === 'LOBBY' ? (
        <Lobby room={room} currentPlayer={currentPlayer} />
      ) : (
        <GameBoard
          room={room}
          currentPlayer={currentPlayer}
          onViewAllCards={handleViewAllCards}
          activities={activities}
        />
      )}
      {showAllCards && (
        <AllCardsView cards={allCards} onClose={() => setShowAllCards(false)} />
      )}
    </div>
  );
};
