import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { Player, Room } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Room])],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
