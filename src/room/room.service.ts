import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, InsertResult } from 'typeorm';
import { LogService } from '../@shared/log-shared/log.service';

/**
 * Service to manage rooms. Room is a space where users can post messages.
 * Each room are linked to a subject and only one user is authorized to
 * create/drop/alter rooms inside a subject.
 */
@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly logService: LogService,
  ) {}

  /**
   * Get the rooms.
   * @param subject
   */
  async getRooms(subject?: string): Promise<Room[]> {
    return await this.roomRepository.find({subject});
  }

  /**
   * Get a room with a subject and its name.
   * @param subject
   */
  async getRoomWithSubjectAndName(subject: string, name: string): Promise<Room> {
    return await this.roomRepository.findOne({subject, name});
  }

  /**
   * Get a room with only an ID.
   * @param subject
   */
  async getRoomWithId(id: number): Promise<Room> {
    return await this.roomRepository.findOne({room_id: id});
  }

  /**
   * Create a room
   * @param subject
   * @param name
   */
  async createRoom(subject: string, name: string): Promise<Room|null> {
    try {
      // Create
      const room: Room = new Room();
      room.subject = subject;
      room.name = name;

      // Insert
      const result: InsertResult = await this.roomRepository.insert(room);

      // Return the entity
      return await this.roomRepository.findOne({room_id: result.identifiers[0].room_id});
      return null;
    } catch (e) {
      // Log error before returning something
      this.logService.error(e.message, {
        message: e.message,
        name: e.name,
        stack: e.stack,
      });
      return null;
    }
  }

}
