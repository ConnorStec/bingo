import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PlayersService } from '../players/players.service';
import { Room, Player } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Player])],
  controllers: [RoomsController],
  providers: [RoomsService, PlayersService],
  exports: [RoomsService],
})
export class RoomsModule {}
