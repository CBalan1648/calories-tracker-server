import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { minimumPasswordLength } from './user-add-body.model';

export class UserCredentialsDto {

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: minimumPasswordLength })
    @Length(minimumPasswordLength)
    password: string;
}
