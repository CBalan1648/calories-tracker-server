import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, IsString } from 'class-validator';
import { MINIMUM_PASS_LENGHT } from '../../config';

export class UserAddNewBodyDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: MINIMUM_PASS_LENGHT })
    @Length(MINIMUM_PASS_LENGHT)
    password: string;
}
