import { Controller, Get, UseGuards, Param, Post, Body, Req, Query, Delete } from '@nestjs/common';
import { IPublicRoom } from '../room/room.entity';
import { ISubject } from '../subjects/subjects.service';
import { ApiService, IPaginedOptions, IPagined } from './api.service';
import { CreateRoomDto } from './create-room.dto';
import { CreateMessageDto } from './create-message.dto';
import { IPublicMessage } from '../messages/message.entity';
import { Request } from 'express';
import { CertificateGuard } from '@thefirstspine/certificate-nest';
import { AuthService, AuthGuard } from '@thefirstspine/auth-nest';
import { CreateMessageSecureDto } from './create-message-secure.dto';
import { AddRoomSenderDto } from './add-room-sender.dto';

/**
 * Main public controller.
 */
@Controller('api')
export class ApiController {

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Endpoint GET /api/subjects
   * Require an access token
   * Get all the subjects
   */
  @Get('subjects')
  @UseGuards(AuthGuard)
  async getSubject(): Promise<ISubject[]> {
    return this.apiService.getSubjects();
  }

  /**
   * Endpoint GET /api/subjects/:subjectName
   * Require an access token
   * Get details on a subject
   * @param params
   */
  @Get('subjects/:subjectName')
  @UseGuards(AuthGuard)
  async getSubjects(@Param() params): Promise<ISubject> {
    return this.apiService.getSubject(params.subjectName);
  }

  /**
   * Endpoint GET /api/subjects/:subjectName/rooms
   * Require an access token
   * Get rooms in a subject
   * @param params
   */
  @Get('subjects/:subjectName/rooms')
  @UseGuards(AuthGuard)
  async getRooms(@Param() params): Promise<IPublicRoom[]> {
    return this.apiService.getRooms(params.subjectName);
  }

  /**
   * Endpoint POST /api/subjects/:subjectName/rooms
   * Require a public certificate
   * Create a room in a subject.
   * @param params
   * @param createRoomDto
   */
  @Post('subjects/:subjectName/rooms')
  @UseGuards(CertificateGuard)
  async createRoom(@Param() params, @Body() createRoomDto: CreateRoomDto): Promise<IPublicRoom> {
    return this.apiService.createRoom(params.subjectName, createRoomDto);
  }

  /**
   * Endpoint GET /api/subjects/:subjectName/rooms/:roomName
   * Require an access token
   * Get details of a room.
   * @param params
   */
  @Get('subjects/:subjectName/rooms/:roomName')
  @UseGuards(AuthGuard)
  async getRoom(@Param() params): Promise<IPublicRoom> {
    return this.apiService.getRoom(params.subjectName, params.roomName);
  }

  /**
   * Endpoint POST /api/subjects/:subjectName/rooms/:roomName/senders
   * Require a public certificate
   * Add a sender in a room.
   * @param params
   * @param addRoomSenderDto
   */
  @Post('subjects/:subjectName/rooms/:roomName/senders')
  @UseGuards(CertificateGuard)
  async addRoomSender(@Param() params, @Body() addRoomSenderDto: AddRoomSenderDto): Promise<IPublicRoom> {
    return this.apiService.addRoomSender(
      params.subjectName,
      params.roomName,
      {
        displayName: addRoomSenderDto.displayName,
        user: addRoomSenderDto.user,
      });
  }

  @Delete('subjects/:subjectName/rooms/:roomName/senders/:user')
  @UseGuards(CertificateGuard)
  async deleteRoomSender(@Param() params): Promise<IPublicRoom> {
    return this.apiService.deleteRoomSender(
      params.subjectName,
      params.roomName,
      parseInt(params.user, 10));
  }

  /**
   * Endpoint POST /api/subjects/:subjectName/rooms/:roomName/messages
   * Require an access token
   * Create a message in a room.
   * @param request
   * @param params
   * @param createMessageDto
   */
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

  /**
   * Endpoint POST /api/subjects/:subjectName/rooms/:roomName/messages/secure
   * Require a public certificate
   * Create a message in a room on behalf of a user.
   * @param params
   * @param createMessageDto
   */
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

  /**
   * Endpoint GET /api/subjects/:subjectName/rooms/:roomName/messages
   * Require an access token
   * Get the messages in a room.
   * @param params
   * @param query
   */
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
