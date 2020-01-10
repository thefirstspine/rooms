import { IsNotEmpty } from 'class-validator';
import { Optional } from '@nestjs/common';

export class CreateMessageDto {

  @IsNotEmpty()
  message: string;

  @Optional()
  user: number;

}
