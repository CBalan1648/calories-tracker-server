import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MealsSchema } from '../meals/meals.schema';
import { AuthModule } from '../auth/auth.module';
import dbTestModule from '../db-test/db-test.module';
import { User } from '../users/models/user.model';
import { UserSchema } from '../users/user.schema';
import { UserService } from '../users/user.service';
import { SuperuserController } from './superuser.controller';
import { DbResponse } from 'src/helpers/db-response.model';

describe('UserController', () => {
    let superuserController: SuperuserController;
    let userService: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                await dbTestModule({ name: (new Date().getTime() * Math.random()).toString(16) }),
                MongooseModule.forFeature([
                    { name: 'Meal', schema: MealsSchema },
                    { name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [SuperuserController],
            providers: [UserService],
        }).compile();

        superuserController = module.get<SuperuserController>(SuperuserController);
        userService = module.get<UserService>(UserService);
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

            superuserController.getAllUsers();
            expect(mockedFindAll).toBeCalled();
        });

        it('Should return a the service user array', async () => {
            jest.spyOn(userService, 'findAll').mockImplementation(() => new Promise((resolve, reject) => resolve(usersArray)));

            expect(await superuserController.getAllUsers()).toBe(usersArray);
        });
    });

    describe('deleteUser', () => {

        const parameters = {
            id : 'ThisIsAUserID',
        };

        const dbResponse: DbResponse = {
            n: 1,
            nModified: 1,
            ok: 1,
        };

        it('Should call userService.deleteUser with the user id', async () => {
            const mockedDeleteUser = jest.fn();

            jest.spyOn(userService, 'delete').mockImplementation(mockedDeleteUser);

            superuserController.deleteUser(parameters);
            expect(mockedDeleteUser).toBeCalledWith(parameters.id);
        });

        it('Should return a the db report', async () => {
            jest.spyOn(userService, 'delete').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await superuserController.deleteUser(parameters)).toBe(dbResponse);
        });
    });

    describe('updateUser', () => {

        const userRequest = {
            user : {
                authLevel : 'USER',
            },
        };

        const adminRequest = {
            user : {
                authLevel : 'ADMIN',
            },
        };

        const parameters = {
            id : 'ThisIsAUserID',
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

            superuserController.updateUser(userRequest, userBody, parameters);
            expect(mockUpdate).toBeCalledWith(parameters.id, userBody);
        });

        it('Should call userService.updateWithPrivileges with the user id', async () => {
            const mockUpdateWithPrivileges = jest.fn();

            jest.spyOn(userService, 'updateWithPrivileges').mockImplementation(mockUpdateWithPrivileges);

            superuserController.updateUser(adminRequest, userBody, parameters);
            expect(mockUpdateWithPrivileges).toBeCalledWith(parameters.id, userBody);
        });

        it('Should return a the db report (update)', async () => {
            jest.spyOn(userService, 'update').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await superuserController.updateUser(userRequest, userBody, parameters)).toBe(dbResponse);
        });

        it('Should return a the db report (updateWithPrivileges)', async () => {
            jest.spyOn(userService, 'updateWithPrivileges').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await superuserController.updateUser(adminRequest, userBody, parameters)).toBe(dbResponse);
        });
    });

    describe('getUser', () => {

        const parameters = {
            id : 'ThisIsAUserID',
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

            superuserController.getUser(parameters);
            expect(mockedFindUser).toBeCalledWith(parameters.id);
        });

        it('Should return a the user', async () => {
            jest.spyOn(userService, 'findUser').mockImplementation(() => new Promise((resolve, reject) => resolve(user)));

            expect(await superuserController.getUser(parameters)).toBe(user);
        });
    });

});
