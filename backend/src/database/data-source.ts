import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
  migrations: isProd
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
