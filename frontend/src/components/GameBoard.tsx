import { type Room, type Player, type CardSpace } from '../types';
import { useSocket } from '../contexts/SocketContext';

interface GameBoardProps {
  room: Room;
  currentPlayer: Player;
}

export const GameBoard = ({ room, currentPlayer }: GameBoardProps) => {
  const { markSpace, unmarkSpace } = useSocket();

  const handleSpaceClick = (space: CardSpace) => {
    if (space.isFreeSpace) return;

    if (!currentPlayer.card) return;

    if (space.isMarked) {
      unmarkSpace(room.id, currentPlayer.card.id, space.position, currentPlayer.id);
    } else {
      markSpace(room.id, currentPlayer.card.id, space.position, currentPlayer.id);
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Bingo!</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Room Code</div>
            <div className="text-2xl font-bold text-purple-600 tracking-widest">
              {room.joinCode}
            </div>
          </div>
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

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-5 gap-2">
            {spaces.map((space) => (
              <button
                key={space.position}
                onClick={() => handleSpaceClick(space)}
                disabled={space.isFreeSpace}
                className={`
                  aspect-square flex items-center justify-center p-2 rounded-lg font-medium text-sm
                  transition-all duration-200 transform hover:scale-105
                  ${
                    space.isFreeSpace
                      ? 'bg-yellow-400 text-yellow-900 cursor-default'
                      : space.isMarked
                      ? 'bg-green-500 text-white shadow-lg scale-95'
                      : 'bg-white text-gray-800 hover:bg-gray-100 cursor-pointer'
                  }
                `}
              >
                <span className="text-center leading-tight break-words">
                  {space.isFreeSpace ? 'FREE' : space.optionText}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Click on a space to mark it. Click again to unmark.
        </div>
      </div>
    </div>
  );
};
