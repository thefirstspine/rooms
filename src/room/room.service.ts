import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  ) {}

  /**
   * Get the rooms.
   * @param subject
   */
  async getRooms(subject?: string): Promise<Room[]> {
    return await this.roomRepository.find({subject});
  }

  /**
   * Create a room
   * @param subject
   * @param name
   */
  async createRoom(subject: string, name: string) {
    return await this.roomRepository.create({
      subject,
      name,
    }).exportPublicAttributes();
  }

}
