import type { PrePopulateMode } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const handleApiResponse = async (response: Response, defaultErrorMessage: string) => {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || defaultErrorMessage);
    } catch (e) {
      // If parsing JSON fails, throw default message
      if (e instanceof Error && e.message !== defaultErrorMessage) {
        throw e;
      }
      throw new Error(defaultErrorMessage);
    }
  }
  return response.json();
};

export const api = {
  async createRoom(title: string, prePopulateMode: PrePopulateMode = 'off') {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, prePopulateMode }),
    });

    return handleApiResponse(response, 'Failed to create room');
  },

  async joinRoom(joinCode: string, name: string, avatarUrl?: string) {
    const response = await fetch(`${API_URL}/rooms/${joinCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, avatarUrl }),
    });

    return handleApiResponse(response, 'Failed to join room');
  },

  async getRoomByJoinCode(joinCode: string) {
    const response = await fetch(`${API_URL}/rooms/by-code/${joinCode}`);
    return handleApiResponse(response, 'Failed to get room');
  },

  async getRoom(roomId: string) {
    const response = await fetch(`${API_URL}/rooms/${roomId}`);
    return handleApiResponse(response, 'Failed to get room');
  },

  async closeRoom(roomId: string) {
    const response = await fetch(`${API_URL}/rooms/${roomId}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleApiResponse(response, 'Failed to close room');
  },
};
