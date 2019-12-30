import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';

export const adminUser: UserRegistrationBodyDto = {
    firstName: 'AdminFirstName',
    lastName: 'AdminLastName',
    email: 'admin@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'ADMIN',
};

export const normalUser: UserRegistrationBodyDto = {
    firstName: 'UserFirstName',
    lastName: 'UserLastName',
    email: 'user@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'USER',
};

export const userManager: UserRegistrationBodyDto = {
    firstName: 'UserManagerFirstName',
    lastName: 'UserManagerLastName',
    email: 'userManager@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'USER_MANAGER',
};
