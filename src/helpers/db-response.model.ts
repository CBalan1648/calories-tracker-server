import { ApiProperty } from '@nestjs/swagger';

export class DbResponse {
    @ApiProperty()
    n: number;

    @ApiProperty()
    nModified: number;

    @ApiProperty()
    ok: number;
}
