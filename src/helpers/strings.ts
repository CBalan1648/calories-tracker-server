export const JWT_NOT_VALID = 'Unauthenticated - Requester Authorization : JWT is not valid';
export const INSUFFICIENT_PRIVILEGES = 'Forbidden - The requester does not have enough privileges';
export const ID_USER_NOT_FOUND = 'Not Found - Target User {id} is not found';
export const BAD_REQUEST = 'Bad Request - The request body does not meet the requirements';
export const USER_NOT_FOUND = 'User could not be found';

export const CREATE_USER = 'Create a new User - Returns created record';
export const LOGIN = 'Login against the DB - Returns JWT';

export const POST_MEAL = 'Create a new Meal - Returns created record';
export const PUT_MEAL = 'Update meal - Returns number of modified items';
export const DELETE_MEAL = 'Update meal - Returns number of modified items';
export const GET_MEALS = 'Get user meals - Returns Meals array';

export const GET_USERS = 'Returns all User records';
export const PUT_USER = 'Update user record - Returns number of modified items';
export const GET_USER = 'Returns target User record';
export const DELETE_USER = 'Delete user - Returns number of modified items';
export const CREATE_USER_ADMIN = 'Create a new User with a selected authLevel - Returns created record';

export const USER_ID_DESCRIPTION = 'Target user id';
export const MEAL_ID_DESCRIPTION = 'Target meal id';
