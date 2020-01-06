import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN, SELF, USER, USER_MANAGER } from './userLevel.constants';
import { UserLevelGuard } from './userLevel.guard';

const user = { authLevel: USER, _id: '507f1f77bcf86cd799439011' };
const params = { id: '507f1f77bcf86cd799439011' };
const returnedHandler = 'thisIsAHandler';

const mockContext = {
    getHandler() {
        return returnedHandler;
    },
    switchToHttp() {
        return {
            getRequest() {
                return {
                    user, params,
                };
            },
        };
    },
};

describe('UserLevelGuard', () => {

    it('Should call the reflector with the required parameters', async () => {

        let callArgumentOne;
        let callArgumentTwo;

        const mockReflector = {
            get(argumentOne, argumentTwo) {

                callArgumentOne = argumentOne;
                callArgumentTwo = argumentTwo;

                return null;
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);
        guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(callArgumentOne).toBe('roles');
        expect(callArgumentTwo).toBe(returnedHandler);
    });

    it('Should return true because there are no role restrictions', async () => {
        const mockReflector = {
            get(_1, _2) {
                return null;
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);
        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(true);
    });

    it('Should return true because USER is in [USER]', async () => {

        const mockReflector = {
            get(_1, _2) {
                return [USER];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(true);
    });

    it('Should return true because USER_MANAGER is in [USER_MANAGER]', async () => {

        user.authLevel = USER_MANAGER;

        const mockReflector = {
            get(_1, _2) {
                return [USER_MANAGER];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(true);
    });

    it('Should return true because ADMIN is in [ADMIN]', async () => {

        user.authLevel = ADMIN;

        const mockReflector = {
            get(_1, _2) {
                return [ADMIN];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(true);
    });

    it('Should return false because USER is not in [USER_MANAGER, ADMIN]', async () => {

        user.authLevel = USER;

        const mockReflector = {
            get(_1, _2) {
                return [USER_MANAGER, ADMIN];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(false);
    });

    it('Should return false because USER(NOT SELF) is not in [SELF, USER_MANAGER, ADMIN]', async () => {

        const id = 'ThisIsAnId';
        const anotherId = 'ThisIsAnAnotherId';

        user.authLevel = USER;
        user._id = id;
        params.id = anotherId;

        const mockReflector = {
            get(_1, _2) {
                return [SELF, USER_MANAGER, ADMIN];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(false);
    });

    it('Should return true because USER(SELF) is in [SELF, USER_MANAGER, ADMIN]', async () => {

        const id = 'ThisIsAnId';

        user.authLevel = USER;
        user._id = id;
        params.id = id;

        const mockReflector = {
            get(_1, _2) {
                return [SELF, USER_MANAGER, ADMIN];
            },
        };

        const guardObject = new UserLevelGuard(mockReflector as unknown as Reflector);

        const returnedValue = guardObject.canActivate(mockContext as unknown as ExecutionContext);

        expect(returnedValue).toBe(true);
    });

});
