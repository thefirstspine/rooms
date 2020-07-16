import { IsNotEmpty } from 'class-validator';
import { Optional } from '@nestjs/common';

export class CreateMessageSecureDto {

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  user: number;

}
