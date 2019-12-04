import { ApiProperty } from '@nestjs/swagger';

export class User {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    _id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    targetCalories: number;

    @ApiProperty()
    authLevel: string;
}
