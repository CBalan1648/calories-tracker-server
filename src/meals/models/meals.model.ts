import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


// TODO : Add pipe validation;
export class Meal {
    @ApiPropertyOptional()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    time: number;

    @ApiProperty()
    calories: number;
}
