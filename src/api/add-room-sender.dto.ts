import { IsNotEmpty, IsArray } from 'class-validator';

export class AddRoomSenderDto {

  @IsNotEmpty()
  user: number;

  @IsNotEmpty()
  displayName: string;

}
