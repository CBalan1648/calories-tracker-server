import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

// TODO extract to external file
export const minimumPasswordLength = 12;

export class UserAddNewBodyDto {
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: minimumPasswordLength })
    @Length(minimumPasswordLength)
    password: string;
}
