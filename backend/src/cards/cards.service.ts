import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { CardSpace } from '../entities/card-space.entity';
import { Room, RoomStatus } from '../entities/room.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardSpace)
    private cardSpaceRepository: Repository<CardSpace>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async createCardsForRoom(roomId: string) {
    // Get room and validate
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: { players: true },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    if (room.status !== RoomStatus.LOBBY) {
      throw new BadRequestException('Cards have already been created');
    }

    if (room.optionsPool.length < 24) {
      throw new BadRequestException('Need at least 24 options to create cards');
    }

    // Create a card for each player
    const cardPromises = room.players.map((player) =>
      this.createCardForPlayer(player.id, roomId, room.optionsPool),
    );

    await Promise.all(cardPromises);

    // Update room status to PLAYING
    room.status = RoomStatus.PLAYING;
    await this.roomRepository.save(room);

    return { success: true };
  }

  async createCardForPlayer(playerId: string, roomId: string, optionsPool: string[]) {
    // Randomly select free space position (0-24)
    const freeSpacePosition = Math.floor(Math.random() * 25);

    // Shuffle the options pool using Fisher-Yates
    const shuffledOptions = this.fisherYatesShuffle([...optionsPool]);

    // Take first 24 options
    const selectedOptions = shuffledOptions.slice(0, 24);

    // Create the card
    const card = this.cardRepository.create({
      playerId,
      roomId,
    });

    await this.cardRepository.save(card);

    // Create spaces (25 total)
    const spaces: Partial<CardSpace>[] = [];
    let optionIndex = 0;

    for (let position = 0; position < 25; position++) {
      if (position === freeSpacePosition) {
        // Free space
        spaces.push({
          cardId: card.id,
          position,
          optionText: 'Free Space',
          isFreeSpace: true,
          isMarked: true, // Free space is auto-marked
        });
      } else {
        // Regular space
        spaces.push({
          cardId: card.id,
          position,
          optionText: selectedOptions[optionIndex],
          isFreeSpace: false,
          isMarked: false,
        });
        optionIndex++;
      }
    }

    await this.cardSpaceRepository.save(spaces);

    return card;
  }

  async markSpace(cardId: string, position: number) {
    const space = await this.cardSpaceRepository.findOne({
      where: { cardId, position },
    });

    if (!space) {
      throw new BadRequestException('Space not found');
    }

    if (space.isFreeSpace) {
      throw new BadRequestException('Cannot manually mark free space');
    }

    space.isMarked = true;
    const updatedSpace = await this.cardSpaceRepository.save(space);

    // Check for win
    const hasWon = await this.checkWinCondition(cardId);

    return { space: updatedSpace, hasWon };
  }

  async unmarkSpace(cardId: string, position: number) {
    const space = await this.cardSpaceRepository.findOne({
      where: { cardId, position },
    });

    if (!space) {
      throw new BadRequestException('Space not found');
    }

    if (space.isFreeSpace) {
      throw new BadRequestException('Cannot unmark free space');
    }

    space.isMarked = false;
    return this.cardSpaceRepository.save(space);
  }

  async checkWinCondition(cardId: string): Promise<boolean> {
    const spaces = await this.cardSpaceRepository.find({
      where: { cardId },
      order: { position: 'ASC' },
    });

    // Create a 5x5 grid
    const grid: boolean[][] = [];
    for (let i = 0; i < 5; i++) {
      grid[i] = [];
      for (let j = 0; j < 5; j++) {
        const position = i * 5 + j;
        grid[i][j] = spaces[position].isMarked;
      }
    }

    // Check rows
    for (let i = 0; i < 5; i++) {
      if (grid[i].every((marked) => marked)) {
        return true;
      }
    }

    // Check columns
    for (let j = 0; j < 5; j++) {
      if (grid.every((row) => row[j])) {
        return true;
      }
    }

    // Check diagonal (top-left to bottom-right)
    if (grid.every((row, i) => row[i])) {
      return true;
    }

    // Check diagonal (top-right to bottom-left)
    if (grid.every((row, i) => row[4 - i])) {
      return true;
    }

    return false;
  }

  async getAllCardsInRoom(roomId: string) {
    const cards = await this.cardRepository.find({
      where: { roomId },
      relations: ['spaces', 'player'],
      order: {
        spaces: {
          position: 'ASC',
        },
      },
    });

    return cards.map(card => ({
      id: card.id,
      playerId: card.playerId,
      playerName: card.player?.name || 'Unknown',
      spaces: card.spaces,
    }));
  }

  private fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
