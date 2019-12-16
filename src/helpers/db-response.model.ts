import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DbResponse {
    @ApiProperty()
    n: number;

    @ApiPropertyOptional()
    nModified?: number;

    @ApiPropertyOptional()
    deletedCount?: number;

    @ApiProperty()
    ok: number;
}
