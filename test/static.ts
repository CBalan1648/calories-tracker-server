import { UserCredentialsDto } from 'src/users/models/user-credentials.model';
import { Meal } from '../src/meals/models/meals.model';
import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';

export const fakeUserId = '507f1f77bcf86cd799439011';

export const fakeMealId = '507f1f77bcf86cd799439012';

export const notValidMongoId = '123';

export const fakeJWT = 'AAAABBBBCCCC';

export const mealBodyOne: Meal = {
    title: 'mealTitle',
    description: 'mealDescription',
    time: 1577712225238,
    calories: 150,
};

export const mealBodyTwo: Meal = {
    title: 'mealTitle2',
    description: 'mealDescription2',
    time: 1577712225238,
    calories: 150,
};

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

export const normalUserLoginCredentials: UserCredentialsDto = {
    email: normalUser.email,
    password: normalUser.password,
};

export const userManagerLoginCredentials: UserCredentialsDto = {
    email: userManager.email,
    password: userManager.password,
};

export const adminUserLoginCredentials: UserCredentialsDto = {
    email: adminUser.email,
    password: adminUser.password,
};
