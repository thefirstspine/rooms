import { Controller, Get, UseGuards, Param, Post, Body, Req, HttpException } from '@nestjs/common';
import { AuthGuard } from '../@shared/auth-shared/auth.guard';
import { IPublicRoom, Room } from '../room/room.entity';
import { ISubject, SubjectsService } from '../subjects/subjects.service';
import { ApiService } from './api.service';
import { CreateRoomDto } from './create-room.dto';
import { CreateMessageDto } from './create-message.dto';
import { IPublicMessage } from '../messages/message.entity';
import { AuthService } from '../@shared/auth-shared/auth.service';
import { Request } from 'express';

/**
 * Main public controller.
 */
@Controller('api')
export class ApiController {

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly subjectsService: SubjectsService,
  ) {}

  @Get('subjects')
  @UseGuards(AuthGuard)
  async getSubject(): Promise<ISubject[]> {
    return this.apiService.getSubjects();
  }

  @Get('subjects/:subjectName')
  @UseGuards(AuthGuard)
  async getSubjects(@Param() params): Promise<ISubject> {
    return this.apiService.getSubject(params.subjectName);
  }

  @Get('subjects/:subjectName/rooms')
  @UseGuards(AuthGuard)
  async getRooms(@Param() params): Promise<IPublicRoom[]> {
    return this.apiService.getRooms(params.subjectName);
  }

  @Post('subjects/:subjectName/rooms')
  @UseGuards(AuthGuard)
  async createRoom(@Req() request: Request, @Param() params, @Body() createRoomDto: CreateRoomDto): Promise<IPublicRoom> {
    // Only authorize the subject's owner
    const jwt: string = request.headers.authorization.replace(/Bearer /, '');
    const user: number = await this.authService.login(jwt);
    const subject: ISubject = this.subjectsService.getSubject(params.subjectName);
    if (user !== subject.owner) {
      throw new HttpException('Not the owner of the subject', 403);
    }

    return this.apiService.createRoom(params.subjectName, createRoomDto);
  }

  @Get('subjects/:subjectName/rooms/:roomName')
  @UseGuards(AuthGuard)
  async getRoom(@Param() params): Promise<IPublicRoom> {
    return this.apiService.getRoom(params.subjectName, params.roomName);
  }

  @Post('subjects/:subjectName/rooms/:roomName/messages')
  @UseGuards(AuthGuard)
  async createMessage(@Req() request: Request, @Param() params, @Body() createMessageDto: CreateMessageDto): Promise<IPublicMessage> {
    // Only authorize the subject's owner
    const jwt: string = request.headers.authorization.replace(/Bearer /, '');
    const user: number = await this.authService.login(jwt);
    const subject: ISubject = this.subjectsService.getSubject(params.subjectName);
    const isOwner: boolean = user === subject.owner;

    return this.apiService.createMessage(
      params.subjectName,
      params.roomName,
      {
        user: isOwner && createMessageDto.user ? createMessageDto.user : user,
        sender: createMessageDto.message,
        message: createMessageDto.message,
      });
  }

  @Get('subjects/:subjectName/rooms/:roomName/messages')
  @UseGuards(AuthGuard)
  async getMessages(@Param() params): Promise<IPublicMessage[]> {
    return this.apiService.getMessages(params.subjectName, params.roomName);
  }

}
