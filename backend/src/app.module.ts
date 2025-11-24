import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { PlayersModule } from './players/players.module';
import { CardsModule } from './cards/cards.module';
import { GameModule } from './game/game.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    RoomsModule,
    PlayersModule,
    CardsModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
