import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
