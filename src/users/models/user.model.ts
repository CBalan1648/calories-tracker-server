import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsMongoId, IsNotEmpty, IsString, Min } from 'class-validator';
import { ADMIN, USER, USER_MANAGER } from '../../helpers/userLevel.constants';

export class User {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsMongoId()
    _id: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @Min(0)
    targetCalories: number;

    @ApiProperty()
    @IsIn([USER, USER_MANAGER, ADMIN])
    authLevel: string;
}
