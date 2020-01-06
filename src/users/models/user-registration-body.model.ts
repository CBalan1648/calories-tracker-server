import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, Length, Min, IsPositive } from 'class-validator';
import { ADMIN, USER, USER_MANAGER } from '../../helpers/userLevel.constants';
import { MINIMUM_PASS_LENGHT } from '../../config';

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

    @ApiProperty({ minLength: MINIMUM_PASS_LENGHT })
    @Length(MINIMUM_PASS_LENGHT)
    password: string;

    @ApiPropertyOptional()
    @Min(0)
    targetCalories?: number;

    @ApiPropertyOptional()
    @IsIn([USER, USER_MANAGER, ADMIN])
    authLevel?: string;
}
