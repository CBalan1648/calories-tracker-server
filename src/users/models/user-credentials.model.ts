import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class UserCredentialsDto {

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: 12 })
    @Length(12)
    password: string;
}
