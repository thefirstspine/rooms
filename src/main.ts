import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogService } from './@shared/log-shared/log.service';
import { ErrorFilter } from './error.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Load dotenv config
  require('dotenv').config();

  // Start app
  const app = await NestFactory.create(AppModule.register());
  app.useGlobalFilters(new ErrorFilter(new LogService('rooms')));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.PORT);
}
bootstrap();
