import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

// TODO : Add pipe validation;
export class Meal {
    @ApiPropertyOptional()
    @IsMongoId()
    _id?: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    @IsNumber()
    time: number;

    @ApiProperty()
    @IsNumber()
    calories: number;
}
