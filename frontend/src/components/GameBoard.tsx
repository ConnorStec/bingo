import { useState } from 'react';
import { type Room, type Player, type CardSpace } from '../types';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';

interface GameBoardProps {
  room: Room;
  currentPlayer: Player;
  onViewAllCards: () => void;
}

export const GameBoard = ({ room, currentPlayer, onViewAllCards }: GameBoardProps) => {
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
    try {
      await navigator.clipboard.writeText(room.joinCode);
      setCopied(true);
      addNotification('Room code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addNotification('Failed to copy room code', 'warning');
    }
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
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bingo!</h1>
          <div className="sm:text-right">
            <div className="text-sm text-gray-600">Room Code</div>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 tracking-widest">
                {room.joinCode}
              </div>
              <button
                onClick={handleCopyRoomCode}
                className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 rounded-lg transition-colors min-h-[32px]"
                title="Copy room code"
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={onViewAllCards}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            View All Cards
          </button>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">
            Players ({room.players.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`px-4 py-2 rounded-full ${
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

        <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          Tap on a space to mark it. Tap again to unmark.
        </div>
      </div>
    </div>
  );
};
