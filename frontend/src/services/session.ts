interface Session {
  playerId: string;
  roomId: string;
  sessionToken: string;
  playerName: string;
}

const SESSION_KEY = 'bingo_session';

export const sessionStorage = {
  save(session: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  get(): Session | null {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(SESSION_KEY);
  },
};
