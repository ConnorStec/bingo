import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card } from '../entities/card.entity';
import { CardSpace } from '../entities/card-space.entity';
import { Room } from '../entities/room.entity';
import { Player } from '../entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardSpace, Room, Player])],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
