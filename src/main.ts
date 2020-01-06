import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SERVER_PORT, ROOT_ADDRESS } from './config';

// TODO remove x-powered-by header
const options = new DocumentBuilder()
.setTitle('Calories Tracker - API Documentation')
.setDescription('This document describes endpoints for users and meals CRUD operations')
.setVersion('1.0')
.addBearerAuth()
.build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(ROOT_ADDRESS, app, document);

  app.enableCors();
  await app.listen(SERVER_PORT);
}
bootstrap();
