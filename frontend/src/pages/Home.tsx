import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { sessionStorage } from '../services/session';
import { useActivity } from '../contexts/ActivityContext';
import type { PrePopulateMode } from '../types';

export const Home = () => {
  const navigate = useNavigate();
  const { addNotification } = useActivity();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');
  const [prePopulateMode, setPrePopulateMode] = useState<PrePopulateMode>('off');

  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) {
      addNotification('Please enter a room title', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const { joinCode } = await api.createRoom(roomTitle.trim(), prePopulateMode);
      navigate(`/join/${joinCode}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create room';
      addNotification(message, 'warning');
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

  const getCreateButtonText = () => {
    if (!isCreating) return 'Create Room';
    if (prePopulateMode === 'ai_gen') return 'Generating Options...';
    return 'Creating...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Bingo Party
        </h1>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Room Title Input */}
            <div>
              <label htmlFor="roomTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Room Title <span className="text-red-500">*</span>
              </label>
              <input
                id="roomTitle"
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="e.g., Thanksgiving Dinner Boomer Quotes"
                maxLength={255}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Pre-populate Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pre-fill Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prePopulate"
                    value="off"
                    checked={prePopulateMode === 'off'}
                    onChange={() => setPrePopulateMode('off')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Off - Start with empty pool</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prePopulate"
                    value="placeholders"
                    checked={prePopulateMode === 'placeholders'}
                    onChange={() => setPrePopulateMode('placeholders')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Placeholders - Option 1, Option 2, etc.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prePopulate"
                    value="ai_gen"
                    checked={prePopulateMode === 'ai_gen'}
                    onChange={() => setPrePopulateMode('ai_gen')}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">AI Generated - Based on room title</span>
                </label>
              </div>
              {prePopulateMode === 'ai_gen' && (
                <p className="text-xs text-gray-500 mt-2">
                  AI will generate 24 bingo options based on your room title. This may take a few seconds.
                </p>
              )}
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating || !roomTitle.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getCreateButtonText()}
            </button>
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
