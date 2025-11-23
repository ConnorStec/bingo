const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async createRoom(prePopulate: boolean = false) {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prePopulate }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  },

  async joinRoom(joinCode: string, name: string, avatarUrl?: string) {
    const response = await fetch(`${API_URL}/rooms/${joinCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, avatarUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join room');
    }

    return response.json();
  },

  async getRoomByJoinCode(joinCode: string) {
    const response = await fetch(`${API_URL}/rooms/by-code/${joinCode}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get room');
    }

    return response.json();
  },

  async getRoom(roomId: string) {
    const response = await fetch(`${API_URL}/rooms/${roomId}`);

    if (!response.ok) {
      throw new Error('Failed to get room');
    }

    return response.json();
  },

  async closeRoom(roomId: string) {
    const response = await fetch(`${API_URL}/rooms/${roomId}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to close room');
    }

    return response.json();
  },
};
