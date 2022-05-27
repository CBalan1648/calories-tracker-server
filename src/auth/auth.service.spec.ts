import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { UserCredentialsDto } from '../users/models/user-credentials.model';
import dbTestModule from '../db-test/db-test.module';
import { UserSchema } from './../users/user.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jtw.strategy';
import { USER_NOT_FOUND } from '../helpers/strings';

const credentials: UserCredentialsDto = {
    email: 'fakeEmail@email.com',
    password: 'password123',
};

const foundUser = {
    firstName: 'firstName',
    lastName: 'lastName',
    _id: '_id',
    email: 'email',
    targetCalories: 'targetCalories',
    authLevel: 'authLevel',
};

describe('MealService', () => {

    let authService: AuthService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [

                dbTestModule(),
                JwtModule.register({
                    secret: 'TestSecret',
                    signOptions: { expiresIn: '24h' },
                }),
                PassportModule,
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
            ],
            providers: [AuthService, JwtStrategy],
        }).compile();
        authService = module.get<AuthService>(AuthService);
    });

    describe('login', () => {

        it('Should find the user and return a token', async () => {

            const mockedFunctionOne = jest.fn();
            const mockedFunctionTwo = jest.fn();

            const returnedAccessToken = 'AAABBBCCC';

            let callArgumentOne;
            let callArgumentTwo;

            const mockEnvironment = {
                findUser(argumentOne: UserCredentialsDto) {
                    mockedFunctionOne();
                    callArgumentOne = argumentOne;
                    return foundUser;
                },
                jwtService: {
                    sign(argumentTwo) {
                        callArgumentTwo = argumentTwo.user;
                        mockedFunctionTwo();
                        return returnedAccessToken;
                    },
                },

            };

            const response = await authService.login.call(mockEnvironment, credentials);

            expect(mockedFunctionOne).toBeCalled();
            expect(mockedFunctionTwo).toBeCalled();
            expect(callArgumentOne).toBe(credentials);
            expect(response.access_token).toBe(returnedAccessToken);
            expect(callArgumentTwo).toBe(foundUser);

        });

        it('Should find the user', async () => {

            const mockedFunction = jest.fn();

            let callArgumentOne;
            let callArgumentTwo;

            const mockEnvironment = {
                userModel: {
                    findOne(argumentOne: UserCredentialsDto, argumentTwo) {
                        mockedFunction();
                        callArgumentOne = argumentOne;
                        callArgumentTwo = argumentTwo;
                        return foundUser;
                    },
                },
            };

            const response = await authService.findUser.call(mockEnvironment, credentials);

            expect(response).toBe(foundUser);

            expect(mockedFunction).toBeCalled();

            expect(callArgumentOne).toBe(credentials);
            expect(callArgumentTwo.password).toBe(0);
            expect(callArgumentTwo.meals).toBe(0);

        });

        it('Should throw USER_NOT_FOUND error', async () => {

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    findOne(_1, _2) {
                        mockedFunction();
                        return null;
                    },
                },
            };

            expect(authService.findUser.call(mockEnvironment, credentials)).rejects.toThrow(USER_NOT_FOUND);
            expect(mockedFunction).toBeCalled();

        });
    });

    describe('verifyToken', () => {
        it('should call jwtService.verify', async () => {
            const mockedFunction = jest.fn();
            const mockEnvironment = {
                jwtService: {
                    verify(argumentOne) {
                        mockedFunction();
                        return argumentOne;
                    },
                },
            };
            const response = await authService.verifyToken.call(mockEnvironment, 'token');
            expect(response.access_token).toBe("token");
            expect(mockedFunction).toBeCalled();
        });

        it('should throw an error', async () => {
            const mockedFunction = jest.fn();
            const mockEnvironment = {
                jwtService: {
                    verify(argumentOne) {
                        mockedFunction();
                        throw new Error('error');
                    },
                },
            };
            expect(authService.verifyToken.call(mockEnvironment, 'token')).rejects.toThrow('error');
            expect(mockedFunction).toBeCalled();
        });
        it('should throw USER_NOT_FOUND error', async () => {
            const mockedFunction = jest.fn();
            const mockEnvironment = {
                jwtService: {
                    verify(argumentOne) {
                        mockedFunction();
                        return null;
                    },
                },
            };
            expect(authService.verifyToken.call(mockEnvironment, 'token')).rejects.toThrow(USER_NOT_FOUND);
            expect(mockedFunction).toBeCalled();
        });
    });
});
