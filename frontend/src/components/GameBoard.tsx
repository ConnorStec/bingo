import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Room, type Player, type CardSpace, type Notification } from '../types';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationLog } from './NotificationLog';
import { copyToClipboard } from '../utils/clipboard';

interface GameBoardProps {
  room: Room;
  currentPlayer: Player;
  onViewAllCards: () => void;
  notifications: Notification[];
}

export const GameBoard = ({ room, currentPlayer, onViewAllCards, notifications }: GameBoardProps) => {
  const navigate = useNavigate();
  const { markSpace, unmarkSpace } = useSocket();
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);

  const handleSpaceClick = (space: CardSpace) => {
    if (space.isFreeSpace) return;

    if (!currentPlayer.card) return;

    if (space.isMarked) {
      unmarkSpace(room.id, currentPlayer.card.id, space.position, currentPlayer.id);
    } else {
      markSpace(room.id, currentPlayer.card.id, space.position, currentPlayer.id);
    }
  };

  const handleCopyRoomCode = async () => {
    await copyToClipboard(
      room.joinCode,
      () => {
        setCopied(true);
        addNotification('Room code copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      },
      (message) => addNotification(message, 'warning')
    );
  };

  if (!currentPlayer.card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading your card...</div>
      </div>
    );
  }

  const spaces = currentPlayer.card.spaces.sort((a, b) => a.position - b.position);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header Row - ~10% */}
      <div className="bg-white shadow-md px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1
            onClick={() => navigate('/')}
            className="text-xl sm:text-2xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
          >
            Bingo!
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Room Code:</span>
            <span className="text-lg sm:text-xl font-bold text-purple-600 tracking-widest">
              {room.joinCode}
            </span>
            <button
              onClick={handleCopyRoomCode}
              className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 rounded transition-colors"
              title="Copy room code"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Remaining space */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
          {/* Bingo Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {spaces.map((space) => (
                <button
                  key={space.position}
                  onClick={() => handleSpaceClick(space)}
                  disabled={space.isFreeSpace}
                  className={`
                    aspect-square flex items-center justify-center p-1 sm:p-2 rounded-lg font-medium text-xs sm:text-sm
                    transition-all duration-200 transform active:scale-95 min-h-[44px] min-w-[44px]
                    ${
                      space.isFreeSpace
                        ? 'bg-yellow-400 text-yellow-900 cursor-default'
                        : space.isMarked
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
                    }
                  `}
                >
                  <span className="text-center leading-tight break-words overflow-hidden">
                    {space.isFreeSpace ? 'FREE' : space.optionText}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Players Section - Compact */}
          <div className="bg-purple-50 rounded-lg p-3 shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-700 text-sm">
                Players ({room.players.length})
              </h2>
              <button
                onClick={onViewAllCards}
                className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                View All Cards
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    player.id === currentPlayer.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Notification Log - Fills remaining space */}
          <div style={{ height: '20vh', minHeight: '120px' }}>
            <NotificationLog notifications={notifications} />
          </div>
        </div>
      </div>
    </div>
  );
};
