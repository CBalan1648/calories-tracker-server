import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MealPostBody {
    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    time: number;

    @ApiProperty()
    calories: number;
}
