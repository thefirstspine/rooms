import { Controller, Get, UseGuards, Param, Post, Body } from '@nestjs/common';
import { AuthGuard } from '../@shared/auth-shared/auth.guard';
import { IPublicRoom } from '../room/room.entity';
import { ISubject } from '../subjects/subjects.service';
import { ApiService } from './api.service';
import { CreateRoomDto } from './create-room.dto';

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
    return await this.apiService.createRoom(params.subjectName, {name: createRoomDto.name});
  }

}
