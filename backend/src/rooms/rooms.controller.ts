import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PlayersService } from '../players/players.service';
import { CardsService } from '../cards/cards.service';
import { JoinRoomDto } from '../common/dto/join-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private roomsService: RoomsService,
    private playersService: PlayersService,
    private cardsService: CardsService,
  ) {}

  @Post()
  async createRoom() {
    const room = await this.roomsService.createRoom();
    return {
      roomId: room.id,
      joinCode: room.joinCode,
    };
  }

  @Post(':joinCode/join')
  async joinRoom(@Param('joinCode') joinCode: string, @Body() joinRoomDto: JoinRoomDto) {
    const room = await this.roomsService.getRoomByJoinCode(joinCode);
    const player = await this.playersService.joinRoom(room.id, joinRoomDto.name, joinRoomDto.avatarUrl);

    return {
      roomId: room.id,
      playerId: player.id,
      sessionToken: player.sessionToken,
    };
  }

  @Get('by-code/:joinCode')
  async getRoomByJoinCode(@Param('joinCode') joinCode: string) {
    const room = await this.roomsService.getRoomByJoinCode(joinCode);
    return {
      id: room.id,
      joinCode: room.joinCode,
      status: room.status,
      isOpen: room.isOpen,
    };
  }

  @Get(':roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomById(roomId);
  }

  @Post(':roomId/close')
  async closeRoom(@Param('roomId') roomId: string) {
    return this.roomsService.closeRoom(roomId);
  }

  @Get(':roomId/cards')
  async getAllCards(@Param('roomId') roomId: string) {
    return this.cardsService.getAllCardsInRoom(roomId);
  }
}
