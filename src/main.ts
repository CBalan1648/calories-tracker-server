import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { CORS_ORIGIN, ROOT_ADDRESS, SERVER_PORT } from './config';

const options = new DocumentBuilder()
.setTitle('Calories Tracker - API Documentation')
.setDescription('This document describes endpoints for users and meals CRUD operations')
.setVersion('1.0')
.addBearerAuth()
.build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(ROOT_ADDRESS, app, document);

  app.enableCors({origin: CORS_ORIGIN});
  await app.listen(SERVER_PORT);
}
bootstrap();
