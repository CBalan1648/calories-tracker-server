import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import dbTestModule from '../db-test/db-test.module';
import { GuestController } from './guest.controller';
import { UserRegistrationBodyDto } from './models/user-registration-body.model';
import { User } from './models/user.model';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {

    let userService: UserService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
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
            authLevel: 'ADMIN',
        };

        it('Should create call the user model with the user', async () => {
            let called: User;

            const mockedSave = jest.fn();

            const mockEnvironment = {
                userModel : (user) => {
                    called = user;
                    return {
                        save : mockedSave,
                    };
                },
            };

            await userService.createNewUser.call(mockEnvironment, testUser);

            expect(mockedSave).toHaveBeenCalled();
            expect(called.firstName).toEqual(testUser.firstName);

        });

        it('Should create a new user ignoring the authLevel', async () => {
            const createNewUser = await userService.createNewUser(testUser);

            expect(createNewUser._id).toBeTruthy();
            expect(createNewUser.firstName).toEqual(testUser.firstName);
            expect(createNewUser.lastName).toEqual(testUser.lastName);
            expect(createNewUser.email).toEqual(testUser.email);
            // @ts-ignore
            expect(createNewUser.password).toBeUndefined();
            expect(createNewUser.authLevel).toEqual('USER');
        });

    });

    describe('createNewUserWithPrivileges', () => {

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test2@test.test',
            password: 'password123',
            authLevel: 'ADMIN',
        };

        it('Should create a new user respecting the authLevel', async () => {
            const createNewUser = await userService.createNewUserWithPrivileges(testUser);

            expect(createNewUser._id).toBeTruthy();
            expect(createNewUser.firstName).toEqual(testUser.firstName);
            expect(createNewUser.lastName).toEqual(testUser.lastName);
            expect(createNewUser.email).toEqual(testUser.email);
            // @ts-ignore
            expect(createNewUser.password).toBeUndefined();
            expect(createNewUser.authLevel).toEqual(testUser.authLevel);
        });

    });

    describe('findAll', () => {

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName1',
            lastName: 'TestLastName1',
            email: 'test3@test.test',
            password: 'password123',
            authLevel: 'ADMIN',
        };

        const testUserTwo: UserRegistrationBodyDto = {
            firstName: 'TestFirstName2',
            lastName: 'TestLastName2',
            email: 'test4@test.test',
            password: 'password123',
            authLevel: 'USER',
        };

        const addedUsersArray = [testUser, testUserTwo];

        it('Should return all users minus passwords and meals', async () => {
            await userService.createNewUserWithPrivileges(testUser);
            await userService.createNewUserWithPrivileges(testUserTwo);
            const users = await userService.findAll();

            for (const [index, testedUser] of [...users].entries()) {

                const addedUser = addedUsersArray[index];
                expect(testedUser._id).toBeTruthy();
                expect(testedUser.firstName).toEqual(addedUser.firstName);
                expect(testedUser.lastName).toEqual(addedUser.lastName);
                expect(testedUser.email).toEqual(addedUser.email);
                expect(testedUser.authLevel).toEqual(addedUser.authLevel);
                // @ts-ignore
                expect(testedUser.password).toBeUndefined();
                // @ts-ignore
                expect(testedUser.meals).toBeUndefined();
            }

        });

    });

    describe('update', () => {

        const testUserRegisterBody: UserRegistrationBodyDto = {
            firstName: 'TestFirstName1',
            lastName: 'TestLastName1',
            email: 'test3@test.test',
            password: 'password123',
            authLevel: 'ADMIN',
        };

        const testUser: User = {
            firstName: 'ModifiedFirstName',
            lastName: 'ModifiedFirstName',
            email: 'NewEmail@test.test',
            authLevel: 'USER',
            _id: 'This does not matter',
            targetCalories: 321,
        };

        it('Should update target user but email and authLevel', async () => {
            const newUser = await userService.createNewUserWithPrivileges(testUserRegisterBody);
            const updated = await userService.update(newUser._id, testUser);
            const users = await userService.findAll();

            expect(updated.nModified).toEqual(1);

            const modifiedUser = users[0];

            expect(modifiedUser._id).toEqual(newUser._id);
            expect(modifiedUser.firstName).toEqual(testUser.firstName);
            expect(modifiedUser.lastName).toEqual(testUser.lastName);
            expect(modifiedUser.email).toEqual(testUserRegisterBody.email);
            expect(modifiedUser.authLevel).toEqual(testUserRegisterBody.authLevel);

        });

    });

    describe('updateWithPrivileges', () => {

        const testUserRegisterBody: UserRegistrationBodyDto = {
            firstName: 'TestFirstName1',
            lastName: 'TestLastName1',
            email: 'test3@test.test',
            password: 'password123',
            authLevel: 'ADMIN',
        };

        const testUser: User = {
            firstName: 'ModifiedFirstName',
            lastName: 'ModifiedFirstName',
            email: 'NewEmail@test.test',
            authLevel: 'USER',
            _id: 'This does not matter',
            targetCalories: 321,
        };

        it('Should update target user but email', async () => {
            const newUser = await userService.createNewUserWithPrivileges(testUserRegisterBody);
            const updated = await userService.updateWithPrivileges(newUser._id, testUser);
            const users = await userService.findAll();

            expect(updated.nModified).toEqual(1);

            const modifiedUser = users[0];

            expect(modifiedUser._id).toEqual(newUser._id);
            expect(modifiedUser.firstName).toEqual(testUser.firstName);
            expect(modifiedUser.lastName).toEqual(testUser.lastName);
            expect(modifiedUser.email).toEqual(testUserRegisterBody.email);
            expect(modifiedUser.authLevel).toEqual(testUser.authLevel);

        });

    });

    describe('delete', () => {

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName1',
            lastName: 'TestLastName1',
            email: 'test3@test.test',
            password: 'password123',
            authLevel: 'ADMIN',
        };

        const testUserTwo: UserRegistrationBodyDto = {
            firstName: 'TestFirstName2',
            lastName: 'TestLastName2',
            email: 'test4@test.test',
            password: 'password123',
            authLevel: 'USER',
        };

        it('Should delete the target user', async () => {
            const userOne = await userService.createNewUserWithPrivileges(testUser);
            const userTwo = await userService.createNewUserWithPrivileges(testUserTwo);
            const users = await userService.findAll();
            const updated = await userService.delete(userOne._id);
            const usersAfterDelete = await userService.findAll();

            expect(users.length).toEqual(2);
            expect(usersAfterDelete.length).toEqual(1);
            expect(updated.deletedCount).toEqual(1);

            const remainingUser = usersAfterDelete[0];
            expect(remainingUser._id).toEqual(userTwo._id);

        });

    });

});
