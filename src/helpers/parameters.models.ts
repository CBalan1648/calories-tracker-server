import { IsMongoId, ValidateIf } from 'class-validator';
import { keyExists } from './helper.functions';

export class Parameters {
    @IsMongoId()
    @ValidateIf(keyExists.bind(null, 'id'))
    id: string;

    @IsMongoId()
    @ValidateIf(keyExists.bind(null, 'mealId'))
    mealId: string;
}
