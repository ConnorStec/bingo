# Bingo Party

A mobile-first web app for playing bingo with family over Thanksgiving evening.

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

## Phase 1 Features

- Room creation and join code system
- Player joining with names
- Adding/removing options from pool
- Card generation and distribution
- Mark/unmark spaces
- Win detection
- Real-time updates via WebSocket
- Session persistence with localStorage

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

See CLAUDE.md for detailed project specification.
