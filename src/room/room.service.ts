import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, InsertResult } from 'typeorm';
import { IPublicRoomSender, RoomSender } from './room-sender.entity';
import { LogsService } from '@thefirstspine/logs-nest';

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
    @InjectRepository(RoomSender)
    private readonly roomSenderRepository: Repository<RoomSender>,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Get the rooms.
   * @param subject
   */
  async getRooms(subject?: string): Promise<Room[]> {
    return this.roomRepository.find({where: {subject}, relations: ['roomSenders']});
  }

  /**
   * Get a room with a subject and its name.
   * @param subject
   */
  async getRoomWithSubjectAndName(subject: string, name: string): Promise<Room> {
    return this.roomRepository.findOne({subject, name}, {relations: ['roomSenders']});
  }

  /**
   * Get a room with only an ID.
   * @param subject
   */
  async getRoomWithId(id: number): Promise<Room> {
    return this.roomRepository.findOne({room_id: id}, {relations: ['roomSenders']});
  }

  /**
   * Create a room
   * @param subject
   * @param name
   */
  async createRoom(subject: string, name: string, senders: IPublicRoomSender[]): Promise<Room|null> {
    try {
      // Create room
      const room: Room = new Room();
      room.subject = subject;
      room.name = name;

      // Insert
      const result: InsertResult = await this.roomRepository.insert(room);
      const roomId: number = result.identifiers[0].room_id;

      // Create senders
      const promises: Array<Promise<InsertResult>> = senders.map((sender: IPublicRoomSender) => {
        const roomSender: RoomSender = new RoomSender();
        roomSender.user = sender.user;
        roomSender.display_name = sender.displayName;
        roomSender.room_id = roomId;
        return this.roomSenderRepository.insert(roomSender);
      });
      await Promise.all(promises);

      // Return the entity
      return this.roomRepository.findOne({room_id: roomId}, {relations: ['roomSenders']});
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

}
