import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';
import { keyExists } from '../../helpers/helper.functions';

export class Meal {
    @ApiPropertyOptional()
    @ValidateIf(keyExists.bind(null, '_id'))
    @IsMongoId()
    _id?: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @ValidateIf(keyExists.bind(null, 'description'))
    @IsString()
    description?: string;

    @ApiProperty()
    @IsNumber()
    time: number;

    @ApiProperty()
    @IsNumber()
    calories: number;
}
