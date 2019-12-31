import { IsMongoId } from 'class-validator';

export class UserIdParameter {
    @IsMongoId()
    id: string;
}
