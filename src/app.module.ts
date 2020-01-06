import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsModule } from './meals/meals.module';
import { MONGO_DB_ADDRESS } from './config';

@Module({
  imports: [UserModule, MealsModule, MongooseModule.forRoot(MONGO_DB_ADDRESS)],
  controllers: [],
  providers: [],
})
export class AppModule { }
