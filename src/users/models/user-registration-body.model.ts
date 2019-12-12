import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, Length, Min } from 'class-validator';
import { ADMIN, USER, USER_MANAGER } from '../../helpers/userLevel.constants';

export class UserRegistrationBodyDto {
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: 12 })
    @Length(12)
    password: string;

    @ApiPropertyOptional()
    @Min(0)
    calories?: number;

    @ApiPropertyOptional()
    @IsIn([USER, USER_MANAGER, ADMIN])
    authLevel?: string;
}
