import { IsMongoId } from 'class-validator';

export class MealIdParameter {
    @IsMongoId()
    mealId: string;
}
