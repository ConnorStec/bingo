import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Room } from '../entities/room.entity';
import { Player } from '../entities/player.entity';
import { Card } from '../entities/card.entity';
import { CardSpace } from '../entities/card-space.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Room, Player, Card, CardSpace],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
