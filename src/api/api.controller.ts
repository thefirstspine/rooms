import { Controller, Get, UseGuards, Param, Post, Body, Req, Query } from '@nestjs/common';
import { IPublicRoom, Room } from '../room/room.entity';
import { ISubject, SubjectsService } from '../subjects/subjects.service';
import { ApiService, IPaginedOptions, IPagined } from './api.service';
import { CreateRoomDto } from './create-room.dto';
import { CreateMessageDto } from './create-message.dto';
import { IPublicMessage } from '../messages/message.entity';
import { Request } from 'express';
import { CertificateGuard } from '@thefirstspine/certificate-nest';
import { AuthService, AuthGuard } from '@thefirstspine/auth-nest';
import { CreateMessageSecureDto } from './create-message-secure.dto';

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
  @UseGuards(CertificateGuard)
  async createRoom(@Param() params, @Body() createRoomDto: CreateRoomDto): Promise<IPublicRoom> {
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
    const user: number = await this.authService.me(jwt);

    return this.apiService.createMessage(
      params.subjectName,
      params.roomName,
      {
        user,
        message: createMessageDto.message,
      });
  }

  @Post('subjects/:subjectName/rooms/:roomName/messages/secure')
  @UseGuards(CertificateGuard)
  async createMessageSecure(@Param() params, @Body() createMessageDto: CreateMessageSecureDto): Promise<IPublicMessage> {
    return this.apiService.createMessage(
      params.subjectName,
      params.roomName,
      {
        user: createMessageDto.user,
        message: createMessageDto.message,
      });
  }

  @Get('subjects/:subjectName/rooms/:roomName/messages')
  @UseGuards(AuthGuard)
  async getMessages(@Param() params, @Query() query): Promise<IPagined<IPublicMessage>> {
    const options: IPaginedOptions = {
      limit: query.limit ? parseInt(query.limit, 10) : 10,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    return this.apiService.getMessages(params.subjectName, params.roomName, options);
  }

}
