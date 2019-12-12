import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsModule } from './meals/meals.module';

@Module({
  imports: [UserModule, MealsModule, MongooseModule.forRoot('mongodb://localhost:27017')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
