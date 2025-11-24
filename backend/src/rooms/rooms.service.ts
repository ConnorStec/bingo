import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from '../entities/room.entity';
import { CreateRoomDto } from '../common/dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async createRoom(createRoomDto?: CreateRoomDto) {
    const joinCode = this.generateJoinCode();

    // Ensure join code is unique
    const existing = await this.roomRepository.findOne({
      where: { joinCode },
    });

    if (existing) {
      // Recursively try again with a new code
      return this.createRoom(createRoomDto);
    }

    // Generate 24 test options if requested
    const optionsPool = createRoomDto?.prePopulate
      ? Array.from({ length: 24 }, (_, i) => `Option ${i + 1}`)
      : [];

    const room = this.roomRepository.create({
      joinCode,
      creatorId: null, // Will be set when first player joins
      status: RoomStatus.LOBBY,
      isOpen: true,
      optionsPool,
    });

    return this.roomRepository.save(room);
  }

  async getRoomByJoinCode(joinCode: string) {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.players', 'player')
      .leftJoinAndSelect('player.card', 'card')
      .leftJoinAndSelect('card.spaces', 'space')
      .where('room.joinCode = :joinCode', { joinCode: joinCode.toUpperCase() })
      .orderBy('space.position', 'ASC')
      .getOne();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async getRoomById(roomId: string) {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.players', 'player')
      .leftJoinAndSelect('player.card', 'card')
      .leftJoinAndSelect('card.spaces', 'space')
      .where('room.id = :roomId', { roomId })
      .orderBy('space.position', 'ASC')
      .getOne();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async closeRoom(roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.isOpen = false;
    return this.roomRepository.save(room);
  }

  async addOptionToPool(roomId: string, option: string) {
    const room = await this.getRoomById(roomId);

    if (room.status !== RoomStatus.LOBBY) {
      throw new BadRequestException('Cannot add options after cards are created');
    }

    room.optionsPool.push(option);
    return this.roomRepository.save(room);
  }

  async removeOptionFromPool(roomId: string, option: string) {
    const room = await this.getRoomById(roomId);

    if (room.status !== RoomStatus.LOBBY) {
      throw new BadRequestException('Cannot remove options after cards are created');
    }

    room.optionsPool = room.optionsPool.filter((opt) => opt !== option);
    return this.roomRepository.save(room);
  }

  async canCreateCards(roomId: string): Promise<boolean> {
    const room = await this.getRoomById(roomId);
    return room.optionsPool.length >= 24 && room.status === RoomStatus.LOBBY;
  }

  async updateRoomStatus(roomId: string, status: RoomStatus) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.status = status;
    return this.roomRepository.save(room);
  }

  private generateJoinCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}
