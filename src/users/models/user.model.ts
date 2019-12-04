export class User {
    firstName: string;
    lastName: string;
    _id: string;
    email: string;
    targetCalories: number;
    authLevel: UserRoles;
}

export enum UserRoles {
    Admin = 'ADMIN',
    UserManager = 'USER_MANAGER',
    User = 'USER',
}
