import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { RoomsService } from '../rooms/rooms.service';
import { CardsService } from '../cards/cards.service';
import { PlayersService } from '../players/players.service';
import { Room, Player, Card, CardSpace } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player, Card, CardSpace])],
  providers: [GameGateway, RoomsService, CardsService, PlayersService],
})
export class GameModule {}
