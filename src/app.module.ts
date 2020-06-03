import { Module, DynamicModule } from '@nestjs/common';
import { LogService } from './@shared/log-shared/log.service';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room/room.service';
import { Room } from './room/room.entity';
import { SubjectsService } from './subjects/subjects.service';
import { MessagesService } from './messages/messages.service';
import { Message } from './messages/message.entity';
import { RoomSender } from './room/room-sender.entity';
import { MessagingService } from './@shared/messaging-shared/messaging.service';
import { IndexController } from './index/index.controller';
import { AuthService } from '@thefirstspine/auth-nest';
import { LogsService } from '@thefirstspine/logs-nest';

@Module({})
export class AppModule {

  public static register(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypeOrmModule.forFeature([Room, RoomSender, Message]),
        TypeOrmModule.forRoot({
          type: 'postgres',
          synchronize: true,
          entities: [__dirname + '/**/**.entity{.ts,.js}'],
          host: process.env.PG_HOST,
          port: parseInt(process.env.PG_PORT, 10),
          username: process.env.PG_USERNAME,
          password: process.env.PG_PASSWORD,
          database: process.env.PG_DATABASE,
        }),
      ],
      controllers: [ApiController, IndexController],
      providers: [
        AuthService,
        {provide: LogService, useValue: new LogService('rooms')},
        LogsService,
        ApiService,
        RoomService,
        SubjectsService,
        MessagesService,
        MessagingService,
      ],
    };
  }

}
