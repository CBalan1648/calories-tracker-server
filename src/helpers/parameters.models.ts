import { IsMongoId, ValidateIf } from 'class-validator';

export class Parameters {
    @IsMongoId()
    @ValidateIf(pararameters => !!pararameters.id)
    id: string;

    @IsMongoId()
    @ValidateIf(pararameters => !!pararameters.mealId)
    mealId: string;
}
