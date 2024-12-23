import { Injectable, HttpException } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { SubjectsService, ISubject } from '../subjects/subjects.service';
import { IPublicRoom, Room } from '../room/room.entity';
import { IPublicMessage, Message } from '../messages/message.entity';
import { MessagesService } from '../messages/messages.service';
import { RoomSender } from '../room/room-sender.entity';
import { MessagingService } from '@thefirstspine/messaging-nest';
import { LogsService } from '@thefirstspine/logs-nest';

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
    private readonly logsService: LogsService,
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
      senders: Array<{user: number, displayName: string}>,
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
   * Add a sender in a given room, in a given subject
   * @param subjectName
   * @param room
   * @param sender
   */
  async addRoomSender(subjectName: string, roomName: string, sender: {user: number, displayName: string}): Promise<IPublicRoom> {
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      throw new HttpException('Room does not exist', 404);
    }

    // Check the sender is not in the room actually
    if (room.roomSenders.find((s: RoomSender) => s.user === sender.user)) {
      throw new HttpException('Sender is already in the room', 400);
    }

    // Add the sender
    await this.roomService.addRoomSender(room.room_id, sender);

    return (await this.roomService.getRoomWithSubjectAndName(subjectName, roomName)).exportPublicAttributes();
  }

  /**
   * Delete a sender in a given room, in a given subject
   * @param subjectName
   * @param room
   * @param sender
   */
  async deleteRoomSender(subjectName: string, roomName: string, user: number): Promise<IPublicRoom> {
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      throw new HttpException('Room does not exist', 404);
    }

    // Check the sender is not in the room actually
    if (!room.roomSenders.find((s: RoomSender) => s.user === user)) {
      throw new HttpException('Sender not in the room', 400);
    }

    // Add the sender
    await this.roomService.deleteRoomSender(room.room_id, user);

    return (await this.roomService.getRoomWithSubjectAndName(subjectName, roomName)).exportPublicAttributes();
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
    message: {user: number, message: string}): Promise<IPublicMessage> {
    
    this.logsService.info("Create message in room", { subjectName, roomName, message });
    this.getSubject(subjectName); // test the subject existence

    // Test the room
    const room: Room|undefined = await this.roomService.getRoomWithSubjectAndName(subjectName, roomName);
    if (!room) {
      this.logsService.error("Room doesn't exist", { subjectName, roomName, message });
      throw new HttpException('Room does not exist', 404);
    }

    // Create the room & test
    const messageCreated: Message|null =
      await this.messagesService.createMessage(room.room_id, message.user, message.message);
    if (!messageCreated) {
      this.logsService.error("Message cannot be created", { subjectName, roomName, message });
      throw new HttpException('Message cannot be created', 400);
    }

    // Notify messaging service
    this.logsService.info(
      "Send message to messaging clients",
      { subject: `TheFirstSpine:messageRoom:${roomName}`, message: messageCreated.exportPublicAttributes() },
    );
    await this.messagingService.sendMessage(
      '*',
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
