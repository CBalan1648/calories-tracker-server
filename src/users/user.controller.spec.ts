import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Parameters } from '../helpers/parameters.models';
import { AuthModule } from '../auth/auth.module';
import dbTestModule from '../db-test/db-test.module';
import { DbResponse } from '../helpers/db-response.model';
import { MealsSchema } from '../meals/meals.schema';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
                MongooseModule.forFeature([
                    { name: 'Meal', schema: MealsSchema },
                    { name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    describe('createUser', () => {

        const testUser: UserRegistrationBodyDto = {
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

            jest.spyOn(userService, 'createNewUserWithPrivileges').mockImplementation(mockedCreateNewUser);

            userController.createUser(testUser);
            expect(mockedCreateNewUser).toBeCalledWith(testUser);
        });

        it('Should return the created user', async () => {
            jest.spyOn(userService, 'createNewUserWithPrivileges').mockImplementation(() => new Promise((resolve, reject) => resolve(createdUser)));

            expect(await userController.createUser(testUser)).toBe(createdUser);
        });
    });

    describe('getAllUsers', () => {

        const userOne: User = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            _id: 'aaa123',
            authLevel: 'USER',
            targetCalories: 0,
        };

        const userTwo: User = {
            firstName: 'TestFirstName2',
            lastName: 'TestLastName2',
            email: 'test@test.test2',
            _id: 'aaa1232',
            authLevel: 'USER',
            targetCalories: 2,
        };

        const usersArray = [userOne, userTwo];

        it('Should call userService.findAll with the received body', async () => {
            const mockedFindAll = jest.fn();

            jest.spyOn(userService, 'findAll').mockImplementation(mockedFindAll);

            userController.getAllUsers();
            expect(mockedFindAll).toBeCalled();
        });

        it('Should return a the service user array', async () => {
            jest.spyOn(userService, 'findAll').mockImplementation(() => new Promise((resolve, reject) => resolve(usersArray)));

            expect(await userController.getAllUsers()).toBe(usersArray);
        });
    });

    describe('deleteUser', () => {

        const parameters: Parameters = {
            id: 'ThisIsAUserID',
            mealId: '',
        };

        const dbResponse: DbResponse = {
            n: 1,
            nModified: 1,
            ok: 1,
        };

        it('Should call userService.deleteUser with the user id', async () => {
            const mockedDeleteUser = jest.fn();

            jest.spyOn(userService, 'delete').mockImplementation(mockedDeleteUser);

            userController.deleteUser(parameters);
            expect(mockedDeleteUser).toBeCalledWith(parameters.id);
        });

        it('Should return a the db report', async () => {
            jest.spyOn(userService, 'delete').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await userController.deleteUser(parameters)).toBe(dbResponse);
        });
    });

    describe('updateUser', () => {

        const userRequest = {
            user: {
                authLevel: 'USER',
            },
        };

        const adminRequest = {
            user: {
                authLevel: 'ADMIN',
            },
        };

        const parameters: Parameters = {
            id: 'ThisIsAUserID',
            mealId: '',
        };

        const userBody: User = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            _id: 'aaa123',
            authLevel: 'user',
            targetCalories: 0,
        };

        const dbResponse: DbResponse = {
            n: 1,
            nModified: 1,
            ok: 1,
        };

        it('Should call userService.update with the user id', async () => {
            const mockUpdate = jest.fn();

            jest.spyOn(userService, 'update').mockImplementation(mockUpdate);

            userController.updateUser(userRequest, userBody, parameters);
            expect(mockUpdate).toBeCalledWith(parameters.id, userBody);
        });

        it('Should call userService.updateWithPrivileges with the user id', async () => {
            const mockUpdateWithPrivileges = jest.fn();

            jest.spyOn(userService, 'updateWithPrivileges').mockImplementation(mockUpdateWithPrivileges);

            userController.updateUser(adminRequest, userBody, parameters);
            expect(mockUpdateWithPrivileges).toBeCalledWith(parameters.id, userBody);
        });

        it('Should return a the db report (update)', async () => {
            jest.spyOn(userService, 'update').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await userController.updateUser(userRequest, userBody, parameters)).toBe(dbResponse);
        });

        it('Should return a the db report (updateWithPrivileges)', async () => {
            jest.spyOn(userService, 'updateWithPrivileges').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await userController.updateUser(adminRequest, userBody, parameters)).toBe(dbResponse);
        });
    });

    describe('getUser', () => {

        const parameters: Parameters = {
            id: 'ThisIsAUserID',
            mealId: '',
        };

        const user: User = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            _id: 'aaa123',
            authLevel: 'user',
            targetCalories: 0,
        };

        it('Should call userService.findUser with the user id', async () => {
            const mockedFindUser = jest.fn();

            jest.spyOn(userService, 'findUser').mockImplementation(mockedFindUser);

            userController.getUser(parameters);
            expect(mockedFindUser).toBeCalledWith(parameters.id);
        });

        it('Should return a the user', async () => {
            jest.spyOn(userService, 'findUser').mockImplementation(() => new Promise((resolve, reject) => resolve(user)));

            expect(await userController.getUser(parameters)).toBe(user);
        });
    });

});
