import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { Player } from '../entities/player.entity';
import { Room } from '../entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Room])],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
