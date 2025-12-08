import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PlayersService } from '../players/players.service';
import { CardsService } from '../cards/cards.service';
import { Room } from '../entities/room.entity';
import { Player } from '../entities/player.entity';
import { Card } from '../entities/card.entity';
import { CardSpace } from '../entities/card-space.entity';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player, Card, CardSpace]), LlmModule],
  controllers: [RoomsController],
  providers: [RoomsService, PlayersService, CardsService],
  exports: [RoomsService],
})
export class RoomsModule {}
