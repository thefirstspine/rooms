import { Module } from '@nestjs/common';
import { LogService } from './@shared/log-shared/log.service';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { AuthService } from './@shared/auth-shared/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room/room.service';
import env from './@shared/env-shared/env';
import { Room } from './room/room.entity';
import { SubjectsService } from './subjects/subjects.service';
import { MessagesService } from './messages/messages.service';
import { Message } from './messages/message.entity';
import { RoomSender } from './room/room-sender.entity';
import { MessagingService } from './@shared/messaging-shared/messaging.service';
import { IndexController } from './index/index.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomSender, Message]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true,
      entities: env.dist ? [__dirname + '/**/**.entity.js'] : [__dirname + '/**/**.entity{.ts,.js}'],
      host: env.config.PG_HOST,
      port: env.config.PG_PORT,
      username: env.config.PG_USERNAME,
      password: env.config.PG_PASSWORD,
      database: env.config.PG_DATABASE,
    }),
  ],
  controllers: [ApiController, IndexController],
  providers: [
    AuthService,
    {provide: LogService, useValue: new LogService('rooms')},
    ApiService,
    RoomService,
    SubjectsService,
    MessagesService,
    MessagingService,
  ],
})
export class AppModule {}
