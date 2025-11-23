import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card, CardSpace, Room, Player } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardSpace, Room, Player])],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
