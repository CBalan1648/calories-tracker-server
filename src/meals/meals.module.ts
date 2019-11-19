import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/user.schema';
import { MealsController } from './meals.controller';
import { MealsSchema } from './meals.schema';
import { MealsService } from './meals.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Meal', schema: MealsSchema }, { name: 'User', schema: UserSchema }]),
    ],
    controllers: [MealsController],
    providers: [MealsService],
})

export class MealsModule { }
