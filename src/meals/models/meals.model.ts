import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class Meal {
    @ApiPropertyOptional()
    @ValidateIf(mealBody => !!mealBody._id)
    @IsMongoId()
    _id?: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @ValidateIf(mealBody => !!mealBody.description)
    @IsString()
    description?: string;

    @ApiProperty()
    @IsNumber()
    time: number;

    @ApiProperty()
    @IsNumber()
    calories: number;
}
