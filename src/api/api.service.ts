import { Injectable, HttpException } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { SubjectsService, ISubject } from '../subjects/subjects.service';
import { IPublicRoom, Room } from '../room/room.entity';
import { IPublicMessage, Message } from '../messages/message.entity';
import { MessagesService } from '../messages/messages.service';
import { IPublicRoomSender } from '../room/room-sender.entity';
import { MessagingService } from '@thefirstspine/messaging-nest';

/**
 * Main service to respond to API requests.
 */
@Injectable()
export class ApiService {

  constructor(
    private readonly roomService: RoomService,
    private readonly subjectsService: SubjectsService,
    private readonly messagesService: MessagesService,
    private readonly messagingService: MessagingService,
  ) {}

  /**
   * Get subjects
   */
  getSubjects(): ISubject[] {
    return this.subjectsService.getSubjects();
  }

  /**
   * Get a subject
   * @param name
   */
  getSubject(name: string): ISubject {
    // Get & test the subject
    const subject: ISubject|undefined = this.subjectsService.getSubject(name);
    if (subject === undefined) {
      throw new HttpException('Subject does not exist', 404);
    }

    return subject;
  }

  /**
   * Get the rooms for a given subject
   * @param subjectName
   */
  async getRooms(subjectName: string): Promise<IPublicRoom[]> {
    this.getSubject(subjectName); // test the subject existence
    return (await this.roomService.getRooms(subjectName)).map((r) => r.exportPublicAttributes());
  }

  /**
   * Creates a room to a given subject
   * @param subjectName
   * @param room
   */
  async createRoom(
    subjectName: string,
    room: {
      name: string,
      senders: IPublicRoomSender[],
    }): Promise<IPublicRoom> {
    this.getSubject(subjectName); // test the subject existence

    // Create the room & test
    const roomCreated: Room|null = await this.roomService.createRoom(subjectName, room.name, room.senders);
    if (!roomCreated) {
      throw new HttpException('Room cannot be created', 400);
    }

    // Return public entity
    return roomCreated.exportPublicAttributes();
  }

  /**
   * Get the room for a given subject
   * @param subjectName
   * @param room
   */
  async getRoom(subjectName: string, roomName: string): Promise<IPublicRoom> {
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      throw new HttpException('Room does not exist', 404);
    }

    // Return public entity
    return room.exportPublicAttributes();
  }

  /**
   * Create a message in a room for a given subject
   * @param subjectName
   * @param roomName
   * @param message
   */
  async createMessage(
    subjectName: string,
    roomName: string,
    message: {user: number, sender: string, message: string}): Promise<IPublicMessage> {
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      throw new HttpException('Room does not exist', 404);
    }

    // Create the room & test
    const messageCreated: Message|null =
      await this.messagesService.createMessage(room.room_id, message.user, message.sender, message.message);
    if (!messageCreated) {
      throw new HttpException('Message cannot be created', 400);
    }

    // Notify messaging service
    await this.messagingService.sendMessage(
      room.roomSenders.map((s) => s.user),
      `TheFirstSpine:messageRoom:${roomName}`,
      messageCreated.exportPublicAttributes(),
    );

    // Return public entity
    return messageCreated.exportPublicAttributes();
  }

  /**
   * Get the messages in a room for a given subject
   * @param subjectName
   * @param roomName
   */
  async getMessages(subjectName: string, roomName: string, options: IPaginedOptions): Promise<IPagined<IPublicMessage>> {
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      throw new HttpException('Room does not exist', 404);
    }

    const messages: Message[] = await this.messagesService.getMessages(room.room_id, options.offset, options.limit);
    const count: number = await this.messagesService.countMessages(room.room_id);
    return {
      count,
      offset: options.offset,
      limit: options.limit,
      data: messages.map((m) => m.exportPublicAttributes()),
    };
  }

}

export interface IPaginedOptions {
  offset: number;
  limit: number;
}

export interface IPagined<T> extends IPaginedOptions {
  count: number;
  data: T[];
}
