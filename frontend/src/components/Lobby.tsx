import { useState } from 'react';
import { type Room, type Player } from '../types';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { copyToClipboard } from '../utils/clipboard';

interface LobbyProps {
  room: Room;
  currentPlayer: Player;
}

export const Lobby = ({ room, currentPlayer }: LobbyProps) => {
  const { addOption, removeOption, createCards } = useSocket();
  const { addNotification } = useNotifications();
  const [newOption, setNewOption] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLengthWarning, setShowLengthWarning] = useState(false);

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOption.trim()) {
      addOption(room.id, newOption.trim());
      setNewOption('');
    }
  };

  const handleRemoveOption = (option: string) => {
    removeOption(room.id, option);
  };

  const handleCreateCards = () => {
    createCards(room.id);
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

  const canCreateCards = room.optionsPool.length >= 24;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Room Lobby</h1>
          <div className="sm:text-right">
            <div className="text-sm text-gray-600">Join Code</div>
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

        <div className="bg-purple-50 rounded-lg p-4">
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
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Bingo Options ({room.optionsPool.length})
          </h2>
          {canCreateCards && (
            <button
              onClick={handleCreateCards}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 px-6 min-h-[44px] rounded-lg transition duration-200"
            >
              Create Cards
            </button>
          )}
        </div>

        {!canCreateCards && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              Need at least 24 options to create cards. Currently have {room.optionsPool.length}.
            </p>
          </div>
        )}

        <form onSubmit={handleAddOption} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => {
                setNewOption(e.target.value);
                setShowLengthWarning(e.target.value.length > 50);
              }}
              placeholder="Add a bingo option..."
              className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
            />
            <button
              type="submit"
              disabled={!newOption.trim()}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-3 px-6 min-h-[44px] rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {showLengthWarning && (
            <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded mt-2">
              ⚠️ This option is quite long ({newOption.length} characters). Consider shortening it for better readability on cards.
            </div>
          )}
        </form>

        <div className="space-y-2">
          {room.optionsPool.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No options yet. Add your first bingo option above!
            </p>
          ) : (
            room.optionsPool.map((option, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition duration-150 gap-2"
              >
                <span className="text-gray-700 flex-1 break-words">{option}</span>
                <button
                  onClick={() => handleRemoveOption(option)}
                  className="text-red-600 hover:text-red-800 active:text-red-900 font-medium transition duration-150 min-h-[44px] px-3"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
