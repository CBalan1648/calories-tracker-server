import { ApiProperty } from '@nestjs/swagger';

export class LoginJwt {
    @ApiProperty()
    access_token: string;
}
