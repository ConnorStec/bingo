import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { RoomsService } from '../rooms/rooms.service';
import { CardsService } from '../cards/cards.service';
import { PlayersService } from '../players/players.service';
import { ChatService } from '../chat/chat.service';
import { Room } from '../entities/room.entity';
import { Player } from '../entities/player.entity';
import { Card } from '../entities/card.entity';
import { CardSpace } from '../entities/card-space.entity';
import { ChatMessage } from '../entities/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player, Card, CardSpace, ChatMessage])],
  providers: [GameGateway, RoomsService, CardsService, PlayersService, ChatService],
})
export class GameModule {}
