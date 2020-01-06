import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';
import { MINIMUM_PASS_LENGHT } from 'src/config';

export class UserCredentialsDto {

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: MINIMUM_PASS_LENGHT })
    @Length(MINIMUM_PASS_LENGHT)
    password: string;
}
