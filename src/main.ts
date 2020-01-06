import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ROOT_ADDRESS, SERVER_PORT, CORS_ORIGIN } from './config';

const options = new DocumentBuilder()
.setTitle('Calories Tracker - API Documentation')
.setDescription('This document describes endpoints for users and meals CRUD operations')
.setVersion('1.0')
.addBearerAuth()
.build();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(ROOT_ADDRESS, app, document);

  const httpAdapter = app.getHttpAdapter();

  app.enableCors({origin:CORS_ORIGIN});
  app.disable('x-powered-by');
  await app.listen(SERVER_PORT);
}
bootstrap();
