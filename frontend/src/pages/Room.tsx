import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { sessionStorage } from '../services/session';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { type Room as RoomType, type Player, type CardSpace } from '../types';
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
  const { addNotification } = useNotifications();
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
        console.error('Failed to load room:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, navigate, joinSocketRoom]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.on('connect', () => {
      addNotification('Connected to server', 'success');
    });

    socket.on('disconnect', () => {
      addNotification('Disconnected from server', 'warning');
    });

    socket.on('reconnect', () => {
      addNotification('Reconnected successfully!', 'success');
      // Reload room data after reconnection
      api.getRoom(roomId!).then((roomData) => {
        setRoom(roomData);
        const player = roomData.players.find((p: Player) => p.id === currentPlayer?.id);
        setCurrentPlayer(player || null);
      });
    });

    socket.on('player-joined', (data) => {
      addNotification(`${data.name} joined the room`, 'info');
      // Reload room data
      api.getRoom(roomId!).then(setRoom);
    });

    socket.on('option-added', (data) => {
      setRoom((prev) =>
        prev ? { ...prev, optionsPool: [...prev.optionsPool, data.option] } : prev
      );
    });

    socket.on('option-removed', (data) => {
      setRoom((prev) =>
        prev
          ? { ...prev, optionsPool: prev.optionsPool.filter((opt) => opt !== data.option) }
          : prev
      );
    });

    socket.on('cards-created', () => {
      addNotification('Cards have been created! Game starting...', 'success');
      // Reload room to get cards
      api.getRoom(roomId!).then(setRoom);
    });

    socket.on('space-marked', (data) => {
      if (data.playerId !== currentPlayer?.id) {
        addNotification(`A player marked: ${data.optionText}`, 'info');
      }
      // Reload room to update card states
      api.getRoom(roomId!).then(setRoom);
    });

    socket.on('space-unmarked', () => {
      // Reload room to update card states
      api.getRoom(roomId!).then(setRoom);
    });

    socket.on('player-won', (data) => {
      addNotification(`${data.name} got BINGO!`, 'success');
    });

    socket.on('room-closed', () => {
      addNotification('Room has been closed to new players', 'info');
      setRoom((prev) => (prev ? { ...prev, isOpen: false } : prev));
    });

    socket.on('game-state', (data) => {
      setRoom(data);
    });

    socket.on('error', (data) => {
      addNotification(data.message, 'warning');
    });

    socket.on('all-cards', (data) => {
      setAllCards(data.cards);
      setShowAllCards(true);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('player-joined');
      socket.off('option-added');
      socket.off('option-removed');
      socket.off('cards-created');
      socket.off('space-marked');
      socket.off('space-unmarked');
      socket.off('player-won');
      socket.off('room-closed');
      socket.off('game-state');
      socket.off('error');
      socket.off('all-cards');
    };
  }, [socket, room, roomId, addNotification, currentPlayer]);

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
        <GameBoard room={room} currentPlayer={currentPlayer} onViewAllCards={handleViewAllCards} />
      )}
      {showAllCards && (
        <AllCardsView cards={allCards} onClose={() => setShowAllCards(false)} />
      )}
    </div>
  );
};
