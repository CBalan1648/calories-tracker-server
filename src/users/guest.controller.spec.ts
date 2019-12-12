import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import dbTestModule from '../db-test/db-test.module';
import { GuestController } from './guest.controller';
import { UserAddNewBodyDto } from './models/user-add-body.model';
import { UserCredentialsDto } from './models/user-credentials.model';
import { User } from './models/user.model';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('GuestController', () => {
    let guestController: GuestController;
    let userService: UserService;
    let authService: AuthService;

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

        guestController = module.get<GuestController>(GuestController);
        userService = module.get<UserService>(UserService);
        authService = module.get<AuthService>(AuthService);
    });

    describe('createUser', () => {

        const testUser: UserAddNewBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            password: 'password123',
        };

        const createdUser: User = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            _id: 'aaa123',
            authLevel: 'user',
            targetCalories: 0,
        };

        it('Should call userService.createUser with the received body', async () => {
            const mockedCreateNewUser = jest.fn();

            jest.spyOn(userService, 'createNewUser').mockImplementation(mockedCreateNewUser);

            guestController.createUser(testUser);
            expect(mockedCreateNewUser).toBeCalledWith(testUser);
        });

        it('Should return the created user', async () => {
            jest.spyOn(userService, 'createNewUser').mockImplementation(() => new Promise((resolve, reject) => resolve(createdUser)));

            expect(await guestController.createUser(testUser)).toBe(createdUser);
        });
    });

    describe('login', () => {

        const loginBody: UserCredentialsDto = {
            email: 'test@test.test',
            password: 'password123',
        };

        const token = { access_token: 'ThisIsARealToken' };

        it('Should call authService.login with the received body', async () => {
            const mockedLogin = jest.fn();

            jest.spyOn(authService, 'login').mockImplementation(mockedLogin);

            guestController.login(loginBody);
            expect(mockedLogin).toBeCalledWith(loginBody);
        });

        it('Should return the userToken', async () => {
            jest.spyOn(authService, 'login').mockImplementation(() => new Promise((resolve, reject) => resolve(token)));

            expect(await guestController.login(loginBody)).toBe(token);
        });
    });

});
