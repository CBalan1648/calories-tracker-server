import { Module } from '@nestjs/common';
import { MealsService } from '../meals/meals.service';
import { UserService } from '../users/user.service';
import { SuperuserController } from './superuser.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsSchema } from '../meals/meals.schema';
import { UserSchema } from '../users/user.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Meal', schema: MealsSchema }, { name: 'User', schema: UserSchema }]),
],
    controllers: [SuperuserController],
    providers: [MealsService, UserService],
})

export class SuperuserModule { }
