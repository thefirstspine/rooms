import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, InsertResult } from 'typeorm';
import { LogsService } from '@thefirstspine/logs-nest';

/**
 * Main messages service. A message is a user's post in a room.
 */
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Creates a message.
   * @param roomId
   * @param user
   * @param sender
   * @param message
   */
  async createMessage(roomId: number, user: number, message: string): Promise<Message> {
    try {
      // Create
      const messageEntity: Message = new Message();
      messageEntity.room_id = roomId;
      messageEntity.user = user;
      messageEntity.message = message;

      // Insert
      const result: InsertResult = await this.messageRepository.insert(messageEntity);

      // Return the entity
      return this.messageRepository.findOne({where: {message_id: result.identifiers[0].message_id}});
    } catch (e) {
      // Log error before returning something
      this.logsService.error(e.message, {
        message: e.message,
        name: e.name,
        stack: e.stack,
      });
      return null;
    }
  }

  /**
   * Get the messages inside a room
   * @param roomId
   */
  async getMessages(roomId: number, skip: number, take: number): Promise<Message[]> {
    return this.messageRepository.createQueryBuilder()
      .where({room_id: roomId})
      .skip(skip)
      .take(take)
      .orderBy({created_at: 'DESC'})
      .getMany();
  }

  /**
   * Get the messages inside a room
   * @param roomId
   */
  async countMessages(roomId: number): Promise<number> {
    return this.messageRepository.count({where: {room_id: roomId}});
  }
}
