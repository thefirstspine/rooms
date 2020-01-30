import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogService } from './@shared/log-shared/log.service';
import { ErrorFilter } from './error.filter';
import env from './@shared/env-shared/env';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ErrorFilter(new LogService('rooms')));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(env.dist ? env.config.PORT : 2505);
}
bootstrap();
