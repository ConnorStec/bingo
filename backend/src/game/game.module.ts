import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { RoomsService } from '../rooms/rooms.service';
import { CardsService } from '../cards/cards.service';
import { PlayersService } from '../players/players.service';
import { ChatService } from '../chat/chat.service';
import { Room, Player, Card, CardSpace, ChatMessage } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player, Card, CardSpace, ChatMessage])],
  providers: [GameGateway, RoomsService, CardsService, PlayersService, ChatService],
})
export class GameModule {}
