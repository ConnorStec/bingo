# Bingo Party

A mobile-first web app for playing bingo with family over Thanksgiving evening. Players collaboratively create a pool of bingo options, receive randomized cards, and mark spaces as events occur throughout the evening.

**Status:** Core features implemented and functional (Phase 1 & 2 complete)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose

### Setup

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create `.env` files from the examples:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   The default values should work for local development.

4. **Run database migrations:**
   ```bash
   npm run migration:run --workspace=backend
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 3000) and frontend (port 5173) servers.

   Alternatively, run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev --workspace=backend

   # Terminal 2 - Frontend
   npm run dev --workspace=frontend
   ```

6. **Open the app:**
   Navigate to `http://localhost:5173` in your browser.

### Development

- **Backend:** NestJS API with Socket.IO at `http://localhost:3000`
- **Frontend:** React + Vite app at `http://localhost:5173`
- **Database:** PostgreSQL at `localhost:5432`

### Project Structure

```
bingo-party/
├── backend/          # NestJS backend with Socket.IO
├── frontend/         # React + Vite frontend
├── docker-compose.yml
└── package.json      # Workspace configuration
```

## Features

### Core Gameplay
- **Room System:** Create rooms with 5-character join codes for easy sharing
- **Collaborative Pool:** Players submit and curate bingo space options together
- **Randomized Cards:** Each player gets a unique 5x5 card with exactly one randomly-placed free space
- **Real-time Marking:** Mark spaces as events occur, with instant updates across all players
- **Win Detection:** Automatic detection of winning lines (horizontal, vertical, diagonal)
- **Multiple Winners:** Support for simultaneous winners

### Technical Features
- **Session Persistence:** Players can disconnect and reconnect without losing progress
- **Card Viewing:** Review all players' cards to see who has what spaces
- **Mobile-First Design:** Responsive UI optimized for phones and tablets
- **Real-time Notifications:** Live updates when players mark spaces or win
- **WebSocket Communication:** Low-latency real-time updates via Socket.IO

## Architecture

### Backend (`/backend`)
- **Framework:** NestJS
- **Database:** PostgreSQL with TypeORM
- **Real-time:** Socket.IO for WebSocket connections
- **Key Services:**
  - `RoomsService`: Room management and options pool
  - `PlayersService`: Player sessions and authentication
  - `CardsService`: Card generation with Fisher-Yates shuffle, mark/unmark, win detection
  - `GameGateway`: Socket.IO event handlers for real-time updates

### Frontend (`/frontend`)
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (mobile-first)
- **Real-time:** Socket.IO client
- **State Management:** React Context (Socket, Notifications)
- **Key Pages:**
  - `Home`: Create or join room
  - `JoinRoom`: Enter player name
  - `Room`: Lobby (add options) or Game (bingo card)

## Deployment

### Production Deployment

The application is ready for deployment to platforms that support Node.js and PostgreSQL:

**Recommended Platforms:**
- **Railway:** Simple deployment with built-in PostgreSQL, good WebSocket support
- **Render:** Free tier available, supports Node + PostgreSQL
- **Fly.io:** Excellent WebSocket support, global edge deployment

**Deployment Checklist:**
1. Set up PostgreSQL database on your hosting platform
2. Configure environment variables (see `.env.example` files)
3. Run database migrations: `npm run migration:run:prod --workspace=backend`
4. Build both frontend and backend: `npm run build`
5. Ensure WebSocket connections are properly configured (Socket.IO uses both HTTP and WebSocket protocols)
6. Configure CORS settings in backend for your frontend domain

**Environment Variables:**
- Backend requires: `DATABASE_URL`, `PORT`, `NODE_ENV`, `FRONTEND_URL`
- Frontend requires: `VITE_BACKEND_URL`, `VITE_WS_URL`

See the `.env.example` files in each workspace for complete configuration.

## Troubleshooting

### Database connection failed
- Ensure Docker is running: `docker ps`
- Check if PostgreSQL container is up: `docker-compose ps`
- Restart the database: `docker-compose restart`

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check `.env` files have correct URLs
- Ensure CORS is properly configured

### TypeORM/Migration errors
- Reset database: `docker-compose down -v && docker-compose up -d`
- Run migrations again: `npm run migration:run --workspace=backend`
- Revert last migration: `npm run migration:revert --workspace=backend`

## Known Limitations & Future Enhancements

### Security Considerations
- **Player ID Spoofing:** Current implementation allows clients to send their own `playerId` in mark/unmark events. This is acceptable for trusted family gameplay but should be addressed before public deployment.
- **Session Token Handling:** Tokens are sent in socket event payloads and visible in network traffic. Consider moving to WebSocket handshake authentication.

### Planned Features
- Avatar upload/selfie/doodle feature
- Room closing mechanism to prevent new players from joining
- Multiple simultaneous games per player
- Game restart/reset functionality
- History and statistics tracking
- Room expiration policy
- Mobile app wrapper for offline support

See CLAUDE.md for detailed project specification and technical implementation notes.
