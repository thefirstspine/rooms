import { Injectable, HttpException } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { SubjectsService, ISubject } from '../subjects/subjects.service';
import { IPublicRoom } from '../room/room.entity';

/**
 * Main service to respond to API requests.
 */
@Injectable()
export class ApiService {

  constructor(
    private readonly roomService: RoomService,
    private readonly subjectsService: SubjectsService,
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
    return await this.roomService.getRooms(subjectName);
  }

  /**
   * Creates a room to a given subject
   * @param subjectName
   * @param room
   */
  async createRoom(subjectName: string, room: {name: string}) {
    this.getSubject(subjectName); // test the subject existence
    return await this.roomService.createRoom(subjectName, room.name);
  }

}
