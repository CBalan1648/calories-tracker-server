import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsSchema } from '../meals/meals.schema';
import { UserSchema } from '../users/user.schema';
import { UserService } from '../users/user.service';
import { SuperuserController } from './superuser.controller';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Meal', schema: MealsSchema },
        { name: 'User', schema: UserSchema }])],
    controllers: [SuperuserController],
    providers: [UserService],
})

export class SuperuserModule { }
