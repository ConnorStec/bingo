import { useState } from 'react';
import { type Room, type Player } from '../types';
import { useSocket } from '../contexts/SocketContext';

interface LobbyProps {
  room: Room;
  currentPlayer: Player;
}

export const Lobby = ({ room, currentPlayer }: LobbyProps) => {
  const { addOption, removeOption, createCards } = useSocket();
  const [newOption, setNewOption] = useState('');

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

  const canCreateCards = room.optionsPool.length >= 24;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Room Lobby</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Join Code</div>
            <div className="text-2xl font-bold text-purple-600 tracking-widest">
              {room.joinCode}
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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Bingo Options ({room.optionsPool.length})
          </h2>
          {canCreateCards && (
            <button
              onClick={handleCreateCards}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
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
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add a bingo option..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newOption.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {room.optionsPool.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No options yet. Add your first bingo option above!
            </p>
          ) : (
            room.optionsPool.map((option, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition duration-150"
              >
                <span className="text-gray-700">{option}</span>
                <button
                  onClick={() => handleRemoveOption(option)}
                  className="text-red-600 hover:text-red-800 font-medium transition duration-150"
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
