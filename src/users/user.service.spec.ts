import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import dbTestModule from '../db-test/db-test.module';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { GuestController } from './guest.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {

    let userService: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                await dbTestModule({ name: (new Date().getTime() * Math.random()).toString(16) }),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [GuestController],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    describe('createNewUser', () => {

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            password: 'password123',
        };

        it('Should create a new user', async () => {
            const createNewUser = await userService.createNewUser(testUser);

            expect(createNewUser._id).toBeTruthy();
            expect(createNewUser.firstName).toEqual(testUser.firstName);
            expect(createNewUser.lastName).toEqual(testUser.lastName);
            expect(createNewUser.email).toEqual(testUser.email);
            // @ts-ignore
            expect(createNewUser.password).toBeUndefined();
        });

    });

});
