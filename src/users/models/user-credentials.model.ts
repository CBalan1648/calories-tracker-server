import { ApiProperty } from '@nestjs/swagger';

export class UserCredentialsDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}
