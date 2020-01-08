import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {

  @IsNotEmpty()
  message: string;

}
