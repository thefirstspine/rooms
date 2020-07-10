import { IsNotEmpty, IsArray } from 'class-validator';
import { IPublicRoomSender } from '../room/room-sender.entity';

export class CreateRoomDto {

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsArray()
  senders: Array<{user: number, displayName: string}>;

}
