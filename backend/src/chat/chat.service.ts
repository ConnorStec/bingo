import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {}

  async createMessage(
    roomId: string,
    playerId: string,
    playerName: string,
    message: string,
  ): Promise<ChatMessage> {
    if (!message.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    const trimmedMessage = message.trim().substring(0, 500);

    const chatMessage = this.chatMessageRepository.create({
      roomId,
      playerId,
      playerName,
      message: trimmedMessage,
    });

    return this.chatMessageRepository.save(chatMessage);
  }

  async getMessagesByRoom(roomId: string, limit = 100): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
