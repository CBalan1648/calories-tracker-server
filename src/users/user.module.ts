import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { GuestController } from './guest.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { MealsSchema } from '../meals/meals.schema';
import { UserController } from './user.controller';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: 'Meal', schema: MealsSchema },
    { name: 'User', schema: UserSchema }])],
  controllers: [GuestController, UserController],
  providers: [UserService],
})
export class UserModule { }
