import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PlayersService } from '../players/players.service';
import { CardsService } from '../cards/cards.service';
import { Room, Player, Card, CardSpace } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player, Card, CardSpace])],
  controllers: [RoomsController],
  providers: [RoomsService, PlayersService, CardsService],
  exports: [RoomsService],
})
export class RoomsModule {}
