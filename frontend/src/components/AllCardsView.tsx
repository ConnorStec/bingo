import { type CardSpace } from '../types';

interface PlayerCard {
  id: string;
  playerId: string;
  playerName: string;
  spaces: CardSpace[];
}

interface AllCardsViewProps {
  cards: PlayerCard[];
  onClose: () => void;
}

export const AllCardsView = ({ cards, onClose }: AllCardsViewProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">All Players' Cards</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((playerCard) => {
            const sortedSpaces = [...playerCard.spaces].sort((a, b) => a.position - b.position);

            return (
              <div key={playerCard.id} className="bg-gray-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                  {playerCard.playerName}
                </h3>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
                  <div className="grid grid-cols-5 gap-1">
                    {sortedSpaces.map((space) => (
                      <div
                        key={space.position}
                        className={`
                          aspect-square flex items-center justify-center p-1 rounded text-[9px] font-medium
                          ${
                            space.isFreeSpace
                              ? 'bg-yellow-400 text-yellow-900'
                              : space.isMarked
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-gray-800'
                          }
                        `}
                      >
                        <span className="text-center leading-tight break-words overflow-hidden line-clamp-2 px-0.5">
                          {space.isFreeSpace ? 'FREE' : space.optionText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No cards have been created yet.
          </div>
        )}
      </div>
    </div>
  );
};
