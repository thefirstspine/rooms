import { Controller, Get, UseGuards, Param, Post, Body, Req } from '@nestjs/common';
import { AuthGuard } from '../@shared/auth-shared/auth.guard';
import { IPublicRoom } from '../room/room.entity';
import { ISubject } from '../subjects/subjects.service';
import { ApiService } from './api.service';
import { CreateRoomDto } from './create-room.dto';
import { CreateMessageDto } from './create-message.dto';
import { IPublicMessage } from '../messages/message.entity';

/**
 * Main public controller.
 */
@Controller('api')
export class ApiController {

  constructor(
    private readonly apiService: ApiService,
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
  async createRoom(@Param() params, @Body() createRoomDto: CreateRoomDto): Promise<IPublicRoom> {
    // TODO: only authorize the subject's user
    return await this.apiService.createRoom(params.subjectName, {name: createRoomDto.name});
  }

  @Get('subjects/:subjectName/rooms/:roomName')
  @UseGuards(AuthGuard)
  async getRoom(@Param() params): Promise<IPublicRoom> {
    return await this.apiService.getRoom(params.subjectName, params.roomName);
  }

  @Post('subjects/:subjectName/rooms/:roomName/messages')
  @UseGuards(AuthGuard)
  async createMessage(@Req() req, @Param() params, @Body() createMessageDto: CreateMessageDto): Promise<IPublicMessage> {
    return await this.apiService.createMessage(
      params.subjectName,
      params.roomName,
      {user: req.user, sender: createMessageDto.message, message: createMessageDto.message});
  }

  @Get('subjects/:subjectName/rooms/:roomName/messages')
  @UseGuards(AuthGuard)
  async getMessages(@Param() params): Promise<IPublicMessage[]> {
    return await this.apiService.getMessages(params.subjectName, params.roomName);
  }

}
