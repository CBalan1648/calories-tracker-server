import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import dbTestModule from '../db-test/db-test.module';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

jest.setTimeout(30000)

const testUser = {
    firstName: 'TestFirstName',
    lastName: 'TestLastName',
    email: 'test@test.test',
    password: 'password123',
};

const createdUser = {
    firstName: 'TestFirstName',
    lastName: 'TestLastName',
    email: 'test@test.test',
    _id: 'aaa123',
    authLevel: 'user',
    targetCalories: 0,
};

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;
    let authService: AuthService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                await dbTestModule({ name: (new Date().getTime() * Math.random()).toString(16) }),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
        authService = module.get<AuthService>(AuthService);
    });

    describe('createUser', () => {
        it('Should return the created user', async () => {
            const user = { id: 'hello' };
            jest.spyOn(userService, 'createNewUser').mockImplementation(() => new Promise((resolve, reject) => resolve(createdUser)));

            expect(await userController.createUser(testUser)).toBe(createdUser);
        });
    });
});
