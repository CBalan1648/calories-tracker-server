import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UserRegistrationBodyDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;
}
