import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { CardsService } from '../cards/cards.service';
import { PlayersService } from '../players/players.service';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private roomsService: RoomsService,
    private cardsService: CardsService,
    private playersService: PlayersService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; sessionToken: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, sessionToken } = data;

    // Verify player
    const player = await this.playersService.getPlayerBySessionToken(sessionToken);
    if (!player || player.roomId !== roomId) {
      client.emit('error', { message: 'Invalid session' });
      return;
    }

    // Join socket room
    client.join(roomId);

    // Update last seen
    await this.playersService.updateLastSeen(player.id);

    // Broadcast to other players
    client.to(roomId).emit('player-joined', {
      playerId: player.id,
      name: player.name,
      avatarUrl: player.avatarUrl,
    });

    // Get room state and chat history
    const room = await this.roomsService.getRoomById(roomId);
    const chatHistory = await this.chatService.getMessagesByRoom(roomId);

    // Send current game state with chat history to connecting player
    client.emit('game-state', {
      ...room,
      chatHistory,
    });
  }

  @SubscribeMessage('add-option')
  async handleAddOption(
    @MessageBody() data: { roomId: string; option: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, option } = data;

    try {
      await this.roomsService.addOptionToPool(roomId, option);
      this.server.to(roomId).emit('option-added', { option });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('remove-option')
  async handleRemoveOption(
    @MessageBody() data: { roomId: string; option: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, option } = data;

    try {
      await this.roomsService.removeOptionFromPool(roomId, option);
      this.server.to(roomId).emit('option-removed', { option });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('create-cards')
  async handleCreateCards(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    try {
      await this.cardsService.createCardsForRoom(roomId);

      // Get updated room state with cards
      const room = await this.roomsService.getRoomById(roomId);

      // Notify all players
      this.server.to(roomId).emit('cards-created', {
        players: room.players.map((p) => ({
          playerId: p.id,
          name: p.name,
          card: p.card,
        })),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark-space')
  async handleMarkSpace(
    @MessageBody() data: { cardId: string; position: number; playerId: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { cardId, position, playerId, roomId } = data;

    try {
      const result = await this.cardsService.markSpace(cardId, position);

      // Broadcast to all players in room
      this.server.to(roomId).emit('space-marked', {
        playerId,
        cardId,
        position,
        optionText: result.space.optionText,
      });

      // If player won, announce it
      if (result.hasWon) {
        const player = await this.playersService.getPlayerBySessionToken(data['sessionToken']);
        this.server.to(roomId).emit('player-won', {
          playerId,
          name: player?.name,
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('unmark-space')
  async handleUnmarkSpace(
    @MessageBody() data: { cardId: string; position: number; playerId: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { cardId, position, playerId, roomId } = data;

    try {
      const space = await this.cardsService.unmarkSpace(cardId, position);

      // Broadcast to all players in room
      this.server.to(roomId).emit('space-unmarked', {
        playerId,
        cardId,
        position,
        optionText: space.optionText,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('close-room')
  async handleCloseRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    try {
      await this.roomsService.closeRoom(roomId);
      this.server.to(roomId).emit('room-closed');
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('get-all-cards')
  async handleGetAllCards(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    try {
      const cards = await this.cardsService.getAllCardsInRoom(roomId);
      client.emit('all-cards', { cards });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send-chat-message')
  async handleSendChatMessage(
    @MessageBody() data: { roomId: string; sessionToken: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, sessionToken, message } = data;

    try {
      // Verify player belongs to room
      const player = await this.playersService.getPlayerBySessionToken(sessionToken);
      if (!player || player.roomId !== roomId) {
        client.emit('error', { message: 'Invalid session' });
        return;
      }

      // Create and save message
      const chatMessage = await this.chatService.createMessage(
        roomId,
        player.id,
        player.name,
        message,
      );

      // Broadcast to all players in room (including sender)
      this.server.to(roomId).emit('chat-message', {
        id: chatMessage.id,
        playerId: chatMessage.playerId,
        playerName: chatMessage.playerName,
        message: chatMessage.message,
        createdAt: chatMessage.createdAt,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
