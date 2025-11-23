import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { sessionStorage } from '../services/session';

export const JoinRoom = () => {
  const { joinCode } = useParams<{ joinCode: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !joinCode) return;

    setIsJoining(true);
    setError('');

    try {
      const { roomId, playerId, sessionToken } = await api.joinRoom(joinCode, name.trim());

      // Save session
      sessionStorage.save({
        playerId,
        roomId,
        sessionToken,
        playerName: name.trim(),
      });

      // Navigate to room
      navigate(`/room/${roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Room</h1>
          <div className="inline-block bg-purple-100 px-6 py-2 rounded-lg">
            <span className="text-gray-600 text-sm">Code:</span>
            <span className="text-2xl font-bold text-purple-600 ml-2 tracking-widest">
              {joinCode}
            </span>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || isJoining}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-purple-600 hover:text-purple-700 font-medium py-2 transition duration-200"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};
