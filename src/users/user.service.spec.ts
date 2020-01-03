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

    beforeAll(async () => {
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

        it('Should create call the userModel.save with the user and ignore the authLevel', async () => {
            let returnedUser: User;
            let savedUser: User;

            const mockedSave = jest.fn();

            const mockEnvironment = {
                userModel: function UserModel(user) {
                    this.user = user;
                    this.save = () => {
                        mockedSave();
                        savedUser = this.user;
                        return this;
                    };
                    this.toObject = () => user;
                },
            };

            returnedUser = await userService.createNewUser.call(mockEnvironment, testUser);

            expect(mockedSave).toHaveBeenCalled();

            expect(savedUser.authLevel).toBeUndefined();
            expect(savedUser.firstName).toEqual(testUser.firstName);
            expect(savedUser.lastName).toEqual(testUser.lastName);
            expect(savedUser.email).toEqual(testUser.email);

            expect(returnedUser.firstName).toEqual(testUser.firstName);
            expect(returnedUser.lastName).toEqual(testUser.lastName);
            expect(returnedUser.email).toEqual(testUser.email);

            // @ts-ignore
            expect(returnedUser.passWord).toBeUndefined();

        });
    });

    describe('createNewUserWithPrivileges', () => {

        it('Should create call the userModel.save with the user', async () => {

            const testUser: UserRegistrationBodyDto = {
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'test2@test.test',
                password: 'password123',
                authLevel: 'ADMIN',
            };

            let returnedUser: User;
            let savedUser: User;

            const mockedSave = jest.fn();

            const mockEnvironment = {
                userModel: function UserModel(user) {
                    this.user = user;
                    this.save = () => {
                        mockedSave();
                        savedUser = this.user;
                        return this;
                    };
                    this.toObject = () => user;
                },
            };

            returnedUser = await userService.createNewUserWithPrivileges.call(mockEnvironment, testUser);

            expect(mockedSave).toHaveBeenCalled();

            expect(savedUser.authLevel).toEqual(testUser.authLevel);
            expect(savedUser.firstName).toEqual(testUser.firstName);
            expect(savedUser.lastName).toEqual(testUser.lastName);
            expect(savedUser.email).toEqual(testUser.email);

            expect(returnedUser.firstName).toEqual(testUser.firstName);
            expect(returnedUser.lastName).toEqual(testUser.lastName);
            expect(returnedUser.email).toEqual(testUser.email);

            // @ts-ignore
            expect(returnedUser.passWord).toBeUndefined();

        });
    });

    describe('findAll', () => {

        it('Should create call the userModel.find.exec with the filterParameters', async () => {
            const filterParametersOne = {};
            const filterParametersTwo = { meals: 0, password: 0 };

            let callParameterOne;
            let callParameterTwo;

            const userOne = 'user';
            const userTwo = 'anotherUser';

            const mockedFind = jest.fn();

            const mockEnvironment = {
                userModel: {
                    find: (parameterOne, parameterTwo) => {
                        callParameterOne = parameterOne;
                        callParameterTwo = parameterTwo;
                        return {
                            exec: () => {
                                mockedFind();
                                return [userOne, userTwo];
                            },
                        };
                    },
                },
            };

            const returnedUsers = await userService.findAll.call(mockEnvironment);

            expect(mockedFind).toHaveBeenCalled();
            expect(callParameterOne).toEqual(filterParametersOne);
            expect(callParameterTwo.meals).toEqual(filterParametersTwo.meals);
            expect(callParameterTwo.password).toEqual(filterParametersTwo.password);
            expect(returnedUsers[0]).toEqual(userOne);
            expect(returnedUsers[1]).toEqual(userTwo);
        });
    });

    describe('update', () => {

        it('Should create call the userModel.updateOne with the user data', async () => {

            const providedId = 'ThisIsAnotherId';

            const updateUser: User = {
                _id: 'ThisIsAnId',
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'test2@test.test',
                authLevel: 'ADMIN',
                targetCalories: 500,
            };

            let callParameterOne;
            let callParameterTwo;

            const mockerUpdate = jest.fn();

            const mockEnvironment = {
                userModel: {
                    updateOne: (parameterOne, parameterTwo) => {
                        mockerUpdate();
                        callParameterOne = parameterOne;
                        callParameterTwo = parameterTwo;
                    },
                },
            };

            await userService.update.call(mockEnvironment, providedId, updateUser);

            expect(mockerUpdate).toHaveBeenCalled();

            expect(callParameterOne._id).toEqual(providedId);
            expect(callParameterTwo.$set.firstName).toEqual(updateUser.firstName);
            expect(callParameterTwo.$set.lastName).toEqual(updateUser.lastName);
            expect(callParameterTwo.$set.targetCalories).toEqual(updateUser.targetCalories);

        });
    });

    describe('updateWithPrivileges', () => {

        it('Should create call the userModel.updateOne with the user data', async () => {

            const providedId = 'ThisIsAnotherId';

            const updateUser: User = {
                _id: 'ThisIsAnId',
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'test2@test.test',
                authLevel: 'ADMIN',
                targetCalories: 500,
            };

            let callParameterOne;
            let callParameterTwo;

            const mockerUpdate = jest.fn();

            const mockEnvironment = {
                userModel: {
                    updateOne: (parameterOne, parameterTwo) => {
                        mockerUpdate();
                        callParameterOne = parameterOne;
                        callParameterTwo = parameterTwo;
                    },
                },
            };

            await userService.updateWithPrivileges.call(mockEnvironment, providedId, updateUser);

            expect(mockerUpdate).toHaveBeenCalled();

            expect(callParameterOne._id).toEqual(providedId);
            expect(callParameterTwo.$set.firstName).toEqual(updateUser.firstName);
            expect(callParameterTwo.$set.lastName).toEqual(updateUser.lastName);
            expect(callParameterTwo.$set.targetCalories).toEqual(updateUser.targetCalories);
            expect(callParameterTwo.$set.authLevel).toEqual(updateUser.authLevel);

        });
    });

    describe('delete', () => {

        it('Should create call the userModel.delete with the user id', async () => {

            const providedId = 'ThisIsAUserId';

            let callParameterOne;

            const mockedDelete = jest.fn();

            const mockEnvironment = {
                userModel: {
                    deleteOne: (parameterOne, parameterTwo) => {
                        mockedDelete();
                        callParameterOne = parameterOne;

                    },
                },
            };

            await userService.delete.call(mockEnvironment, providedId);

            expect(mockedDelete).toHaveBeenCalled();
            expect(callParameterOne._id).toEqual(providedId);
        });
    });

    describe('findUser', () => {

        it('Should call the userModel.find with the user id', async () => {

            const providedId = 'ThisIsAUserId';

            const firstResult = {user : 'USER'};

            let callParameterOne;

            const mockedFind = jest.fn();

            const mockEnvironment = {
                userModel: {
                    find: (parameterOne) => {
                        mockedFind();
                        callParameterOne = parameterOne;
                        return [firstResult];
                    },
                },
            };

            const returnedValue = await userService.findUser.call(mockEnvironment, providedId);

            expect(returnedValue).toEqual(firstResult);
            expect(mockedFind).toHaveBeenCalled();
            expect(callParameterOne._id).toEqual(providedId);
        });
    });
});
