import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { Room } from '../entities/room.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async joinRoom(roomId: string, name: string, avatarUrl?: string) {
    // Check if room exists and is open
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    if (!room.isOpen) {
      throw new BadRequestException('Room is closed');
    }

    // Generate session token
    const sessionToken = this.generateSessionToken();

    // Create player
    const player = this.playerRepository.create({
      roomId,
      name,
      sessionToken,
      avatarUrl,
    });

    await this.playerRepository.save(player);

    // If this is the first player, set them as creator
    const playerCount = await this.playerRepository.count({
      where: { roomId },
    });

    if (playerCount === 1) {
      room.creatorId = player.id;
      await this.roomRepository.save(room);
    }

    return player;
  }

  async getPlayerBySessionToken(sessionToken: string) {
    return this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.room', 'room')
      .leftJoinAndSelect('player.card', 'card')
      .leftJoinAndSelect('card.spaces', 'space')
      .where('player.sessionToken = :sessionToken', { sessionToken })
      .orderBy('space.position', 'ASC')
      .getOne();
  }

  async updateLastSeen(playerId: string) {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new BadRequestException('Player not found');
    }

    player.lastSeen = new Date();
    return this.playerRepository.save(player);
  }

  private generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }
}
