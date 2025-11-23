import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { sessionStorage } from '../services/session';

export const Home = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [prePopulateOptions, setPrePopulateOptions] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const { joinCode } = await api.createRoom(prePopulateOptions);
      navigate(`/join/${joinCode}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const normalizedCode = joinCode.toUpperCase();
    setIsJoining(true);

    try {
      // Check if we have an existing session
      const session = sessionStorage.get();

      if (session) {
        // Fetch room info to get roomId
        const room = await api.getRoomByJoinCode(normalizedCode);

        // If session matches this room, reconnect directly
        if (session.roomId === room.id) {
          navigate(`/room/${room.id}`);
          return;
        }
      }

      // No matching session, go to join flow
      navigate(`/join/${normalizedCode}`);
    } catch (error) {
      // Room doesn't exist or error occurred, go to join flow anyway
      // The join flow will handle the error
      navigate(`/join/${normalizedCode}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Bingo Party
        </h1>

        <div className="space-y-6">
          <div className="space-y-3">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create New Room'}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={prePopulateOptions}
                onChange={(e) => setPrePopulateOptions(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span>Pre-fill options</span>
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom}>
            <div className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase text-center text-2xl font-bold tracking-widest"
              />
              <button
                type="submit"
                disabled={!joinCode.trim() || isJoining}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
