# Bingo Party - Project Specification

**Status:** Core features implemented and functional (Phase 1 complete)

## Project Overview

A mobile-first web app for playing bingo with family over Thanksgiving evening. Players collaboratively create a pool of bingo options, receive randomized cards, and mark spaces as events occur throughout the evening.

## Tech Stack

### Backend
- **Framework:** NestJS
- **Real-time:** Socket.IO for WebSocket connections
- **Database:** PostgreSQL with TypeORM
- **Key Services:**
  - `RoomsService`: Room management and options pool
  - `PlayersService`: Player sessions and authentication
  - `CardsService`: Card generation with Fisher-Yates shuffle, mark/unmark, win detection
  - `GameGateway`: Socket.IO event handlers for real-time updates

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4 (mobile-first)
- **Real-time:** Socket.IO client
- **Routing:** React Router
- **State Management:** React Context (Socket, Notifications)
- **Key Pages:**
  - `Home`: Create or join room
  - `JoinRoom`: Enter player name
  - `Room`: Lobby (add options) or Game (bingo card)

### Infrastructure
- **Development:** Docker Compose for PostgreSQL
- **Deployment:** Railway, Render, or Fly.io recommended for production

## Core User Flow

1. A user creates a "room" and receives a join code
2. Other players use the join code to enter the room
3. All players submit bingo space options to a shared pool
4. Players can remove options from the pool before cards are created
5. Once the pool has at least 24 options, any player can trigger card creation/distribution
6. Each player receives a randomized 5x5 bingo card with exactly 1 "Free Space" randomly placed and automatically marked
7. Players mark spaces on their cards as events occur during dinner
8. All players see notifications when someone marks a space
9. Players can unmark spaces if they determine it was erroneous
10. First player(s) to complete a full line (horizontal, vertical, or diagonal) wins
11. Multiple winners are possible if multiple players complete lines simultaneously
12. Players can continue playing after winners are announced

## Technical Requirements

### Identity & Sessions
- Use localStorage and/or session tokens for player identity
- No user accounts required
- Players enter their name when joining a room
- Session persistence handles disconnection/reconnection (no complex rejoin logic needed)
- Multiple tabs/devices per player is not a concern

### Player Profiles
- Players enter their name when joining
- **Nice-to-have:** Option to take a selfie, upload a picture, or doodle a simple avatar

### Real-time Features
- Players joining the room
- Options being added to the pool
- Options being removed from the pool
- Cards being created and distributed
- Spaces being marked/unmarked
- Winner announcements
- Visual in-app notifications only (no sound effects)

### Room Mechanics
- Rooms have a 5 character alphanumeric join code
- Room creator has no special privileges once the room is created
- If the creator leaves, the room continues
- All players have equal abilities within a room
- Players can "close" the room to prevent new players from joining
- **For MVP:** Players limited to one active game at a time
- **Future:** Players can join multiple rooms at a time

### Game State Phases
1. **Lobby**: Players joining, submitting/removing options from pool
2. **Playing**: Cards distributed, marking in progress  
3. **Finished**: Winner(s) declared, but players can continue marking

### Pool & Card Generation
- Pool can contain any number of options
- Minimum 24 options required to create cards
- Simple frontend validation when adding options (basic duplicate checking)
- Players can debate nuanced duplicates in person and remove as needed
- When cards are created:
  - Each card is a 5x5 grid (25 spaces total)
  - Exactly 1 "Free Space" placed randomly on each card (excluding corners and center: positions 0, 4, 12, 20, 24)
  - Remaining 24 spaces filled from the pool
  - Each card must be unique (different random arrangement)
  - Use Fisher-Yates shuffle algorithm per card
- Once cards are created, no new options can be added to the pool
- Players joining after card creation receive their own randomized card

### Marking & Winning
- Any player with a space on their card can mark it when the event occurs
- Multiple players can mark the same space simultaneously
- Players can unmark spaces if determined to be erroneous
- Server validates win conditions when spaces are marked
- Win condition: Complete any full line of 5 marked spaces
  - 5 horizontal lines
  - 5 vertical lines  
  - 2 diagonal lines
  - Total: 12 possible winning lines
- Multiple simultaneous winners are possible
- Late joiners must manually mark spaces that were already marked by others

### Card Visibility
- All players can review all cards in the room
- This allows players to see who has what spaces

### Persistence
- Game will be played over several hours
- Players must be able to disengage and return to their card at any time
- Rooms should be invitable before Thanksgiving night to allow pre-populating options
- Solution: Use a database (PostgreSQL preferred, but MySQL acceptable)

### Content Moderation
- No content filtering needed (family game, vulgar options are acceptable)

### Constraints & Limitations for MVP
- No minimum or maximum player counts
- No timer or round structure
- No chat feature
- No sound effects
- No game restart/reset functionality
- No history/statistics tracking (save for post-MVP)
- No complex reconnection logic beyond session tokens

### Security Considerations

**Known Issues (Trust-Based Design):**
- **Player ID Spoofing**: The current implementation allows clients to send their own `playerId` in mark-space and unmark-space events. This means a malicious player could theoretically mark spaces on other players' cards.
  - **Current Status**: Acceptable for MVP as this is a family game with trusted participants
  - **Future Improvement**: Derive `playerId` from session token on the server side for all mark/unmark operations
  - **Impact**: Low priority for trusted family gameplay, but should be addressed before public deployment

**Session Token Handling:**
- Session tokens are currently sent in socket event payloads
- Tokens are visible in network traffic (WebSocket messages)
- **Future Improvement**: Consider moving authentication to WebSocket handshake or using JWT with proper expiration

## Data Model

### Room
```typescript
{
  id: string;
  joinCode: string; // 5 char alphanumeric, unique
  creatorPlayerId: string;
  status: 'lobby' | 'playing' | 'finished';
  isOpen: boolean; // can new players join?
  optionsPool: string[]; // submitted bingo options
  createdAt: Date;
  lastActivity: Date;
}
```

### Player
```typescript
{
  id: string;
  roomId: string;
  name: string;
  sessionToken: string;
  avatarUrl?: string; // optional, for nice-to-have feature
  lastSeen: Date;
}
```

### Card
```typescript
{
  id: string;
  playerId: string;
  roomId: string;
  spaces: CardSpace[]; // exactly 25 items
}

interface CardSpace {
  position: number; // 0-24
  optionText: string | null; // null for free space
  isFreeSpace: boolean;
  isMarked: boolean;
}
```

## API & Socket Events

### HTTP Endpoints
- `POST /rooms` - Create a new room, returns room + joinCode
- `POST /rooms/:joinCode/join` - Join a room with name (and optional avatar)
- `GET /rooms/:roomId` - Get room state (for reconnection)
- `POST /rooms/:roomId/close` - Close room to new players

### Socket Events (Client → Server)
- `add-option` - Add option to pool
- `remove-option` - Remove option from pool  
- `create-cards` - Trigger card generation for all players
- `mark-space` - Mark a space on player's card
- `unmark-space` - Unmark a space on player's card

### Socket Events (Server → Client)
- `player-joined` - New player entered the room
- `option-added` - Option added to pool
- `option-removed` - Option removed from pool
- `cards-created` - Cards generated and distributed
- `space-marked` - Player marked a space (includes playerId, position)
- `space-unmarked` - Player unmarked a space
- `player-won` - Player completed a line (may be multiple simultaneous)
- `room-closed` - Room closed to new players
- `game-state` - Full game state sync (for reconnection)

## Implementation Notes

### Join Code Generation
- Generate random 5 character alphanumeric string
- Check database for uniqueness before assigning
- Case-insensitive for user entry

### Card Generation Algorithm
```
For each player:
  1. Create array of 25 positions (0-24)
  2. Randomly select one position for Free Space
  3. Shuffle the optionsPool using Fisher-Yates
  4. Take first 24 options from shuffled pool
  5. Fill non-free-space positions with these options
  6. Save card to database
```

### Win Detection
```
When a player marks a space:
  1. Update card in database
  2. Check all 12 possible winning lines:
     - Rows: [0-4], [5-9], [10-14], [15-19], [20-24]
     - Cols: [0,5,10,15,20], [1,6,11,16,21], etc.
     - Diag: [0,6,12,18,24], [4,8,12,16,20]
  3. If any line is complete, emit 'player-won' event
  4. Mark player as winner in database (for history)
```

### Session Reconnection
```
On socket reconnect:
  1. Client sends sessionToken
  2. Server looks up Player by token
  3. Server sends full game state:
     - Room info
     - All players
     - Options pool
     - Player's card
     - All current marks
```

## Implemented Features

✅ **Phase 1 - Core Game Loop (Complete)**
- Room creation and join code system
- Player joining with names
- Adding/removing options from pool
- Card generation and distribution
- Mark/unmark spaces
- Win detection
- Real-time updates via WebSocket
- Session persistence with localStorage

✅ **Phase 2 - Polish (Complete)**
- Mobile-first responsive design
- Real-time notifications
- Card viewing for all players
- Reconnection handling

## Future Enhancements

- Avatar upload/selfie/doodle feature
- Room closing mechanism
- Multiple simultaneous games per player
- Game restart/reset functionality
- History and statistics tracking
- Room expiration policy
- Mobile app wrapper for better offline support

## Success Criteria

The MVP meets the following criteria:
- ✅ Family members can create and join rooms with ease
- ✅ Options can be collaboratively added and curated
- ✅ Cards are properly randomized with exactly one free space each
- ✅ Real-time marking works smoothly across devices
- ✅ Winners are correctly detected
- ✅ Players can step away and return to their cards
- ✅ The experience works well on mobile devices
- 🎯 The game runs smoothly on Thanksgiving night for 4-8 hours (pending live testing)


# IMPORTANT
- the frontend has `verbatimModuleSyntax` enabled. always import types using the `type` notation, like this `import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';`