import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { GuestController } from '../src/users/guest.controller';
import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';
import { User } from '../src/users/models/user.model';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { USER } from '../src/helpers/userLevel.constants';

const adminUser: UserRegistrationBodyDto = {
    firstName: 'AdminFirstName',
    lastName: 'AdminLastName',
    email: 'admin@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'ADMIN',
};

const normalUser: UserRegistrationBodyDto = {
    firstName: 'UserFirstName',
    lastName: 'UserLastName',
    email: 'user@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'USER',
};

const userManager: UserRegistrationBodyDto = {
    firstName: 'UserManagerFirstName',
    lastName: 'UserManagerLastName',
    email: 'userManager@caloriesTracker.com',
    password: '123123123123',
    authLevel: 'USER_MANAGER',
};

describe('UserController (e2e)', () => {
    let app;
    let guestController: GuestController;
    let userService: UserService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [UserController, GuestController],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
        guestController = module.get<GuestController>(GuestController);

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

    });

    describe('/api/users/ (POST)', () => {

        let createdAdminUser;
        let adminLogin;

        let createdRegularUser;
        let userLogin;

        let createdUserManager;
        let userManagerLogin;

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            password: 'password123123',
            authLevel: USER,
            targetCalories: 0,
        };

        const testUserEmptyFirstName: UserRegistrationBodyDto = {
            ...testUser,
            firstName: '',
        };

        const testUserEmptyLastName: UserRegistrationBodyDto = {
            ...testUser,
            lastName: '',
        };

        const testUserInvalidEmail: UserRegistrationBodyDto = {
            ...testUser,
            email: 'Hello',
        };

        const testUserTooShortPassword: UserRegistrationBodyDto = {
            ...testUser,
            password: 'password',
        };

        const testUserInvalidUserLevel: UserRegistrationBodyDto = {
            ...testUser,
            authLevel: 'SUPREME_ADMIRAL_COMMANDER',
        };

        const testUserNegativeCalories: UserRegistrationBodyDto = {
            ...testUser,
            targetCalories: -1,
        };

        it('Should generate admin account and login', async () => {
            createdAdminUser = await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        });

        it('Should generate user account and login', async () => {
            createdRegularUser = await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        });

        it('Should generate user manager account and login', async () => {
            createdUserManager = await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login({ email: userManager.email, password: userManager.password });
        });

        it('Should return 200 - create a new user', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            const createdNewUser = response.body;

            expect(createdNewUser._id).toBeTruthy();
            expect(createdNewUser.firstName).toEqual(testUser.firstName);
            expect(createdNewUser.lastName).toEqual(testUser.lastName);
            expect(createdNewUser.email).toEqual(testUser.email);
            // @ts-ignore
            expect(createdNewUser.password).toBeUndefined();
            expect(createdNewUser.authLevel).toEqual('USER');
        });

        it('Should return 400 - Bad request because of the empty first name', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserEmptyFirstName)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('firstName');
        });

        it('Should return 400 - Bad request because of the empty last name', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserEmptyLastName)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('lastName');
        });

        it('Should return 400 - Bad request because of the "email" not being an email', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserInvalidEmail)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('email');
        });

        it('Should return 400 - Bad request because of the password being shorter than 12 chars', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserTooShortPassword)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('password');
        });

        it('Should return 400 - Bad request because of the invalid authorization level', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserInvalidUserLevel)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('authLevel');
        });

        it('Should return 400 - Bad request because of the negative calories number', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserNegativeCalories)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('targetCalories');
        });

        it('Should return 400 - Bad request because of the negative calories number', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUserNegativeCalories)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('targetCalories');
        });

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);

        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer TheQuickBrownFoxJumpsOverTheLazyDog')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);

        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [ADMIN]', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);

        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER_MANAGER in [ADMIN]', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);

        });

    });

    describe('/api/users/ (GET)', () => {

        let createdAdminUser;
        let adminLogin;

        let createdRegularUser;
        let userLogin;

        let createdUserManager;
        let userManagerLogin;

        it('Should generate admin account and login', async () => {
            createdAdminUser = await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        });

        it('Should generate user account and login', async () => {
            createdRegularUser = await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        });

        it('Should generate user manager account and login', async () => {
            createdUserManager = await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login({ email: userManager.email, password: userManager.password });
        });

        it('Should return 200 - return all users minus passwords and meals', async () => {

            const response = await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            const users = response.body;

            const addedUsersArray = [adminUser, normalUser];

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

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            const response = await request(app.getHttpServer())
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);

        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            const response = await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', 'Bearer TheQuickBrownFoxJumpsOverTheLazyDog')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);

        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [ADMIN, USER_MANAGER]', async () => {

            const response = await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);

        });

    });

    describe('/api/users/{userId} (PUT)', () => {

        let createdAdminUser;
        let adminLogin;

        let createdRegularUser;
        let userLogin;

        let createdUserManager;
        let userManagerLogin;

        it('Should generate admin account and login', async () => {
            createdAdminUser = await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        });

        it('Should generate user account and login', async () => {
            createdRegularUser = await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        });

        it('Should generate user manager account and login', async () => {
            createdUserManager = await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login({ email: userManager.email, password: userManager.password });
        });

        it('Should update target user but email and authLevel', async () => {

            console.log("HELLO", createdRegularUser)

            const testUserPutBody: User = {
                _id: createdRegularUser._id,
                firstName: 'newUserFirstName2',
                lastName: 'newUserLastName2',
                email: 'newUser@caloriesTracker.com',
                authLevel: 'USER_MANAGER',
                targetCalories: 900,
            };

            const response = await request(app.getHttpServer())
                .put(`/api/users/${createdRegularUser._id}`)
                .send(testUserPutBody)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            console.log('THIS IS THE RESPONSE', response.body);
            // expect(response.body.nModified).toEqual(1);

            const updatedUser = await userService.findUser(createdRegularUser._id);

            expect(updatedUser._id).toEqual(createdRegularUser._id);
            expect(updatedUser.firstName).toEqual(testUserPutBody.firstName);
            expect(updatedUser.lastName).toEqual(testUserPutBody.lastName);
            expect(updatedUser.email).toEqual(createdRegularUser.email);
            expect(updatedUser.authLevel).toEqual(createdRegularUser.authLevel);

        });

        it('Should update target user but email', async () => {

            const testUserPutBody: User = {
                _id: createdRegularUser._id,
                firstName: 'anotherFirstName3',
                lastName: 'anotherLastName3',
                email: 'newUser@caloriesTracker.com',
                authLevel: 'USER_MANAGER',
                targetCalories: 700,
            };

            const response = await request(app.getHttpServer())
                .put(`/api/users/${createdRegularUser._id}`)
                .send(testUserPutBody)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            // expect(response.body.nModified).toEqual(1);

            const updatedUser = await userService.findUser(createdRegularUser._id);

            expect(updatedUser._id).toEqual(createdRegularUser._id);
            expect(updatedUser.firstName).toEqual(testUserPutBody.firstName);
            expect(updatedUser.lastName).toEqual(testUserPutBody.lastName);
            expect(updatedUser.email).toEqual(createdRegularUser.email);
            expect(updatedUser.authLevel).toEqual(testUserPutBody.authLevel);

        });

        test.todo('401, 403, not self');

    });

    describe('/api/users/{userId} (DELETE)', () => {

        it('Should delete the target user', async () => {

            const createdAdminUser = await userService.createNewUserWithPrivileges(adminUser);
            const adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });

            const testUser: UserRegistrationBodyDto = {
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'testUser@caloriesTracker.com',
                password: '123123123123',
                authLevel: 'USER',
            };

            const createdTestUser = await userService.createNewUserWithPrivileges(testUser);
            const testLogin = await guestController.login({ email: testUser.email, password: testUser.password });

            const response = await request(app.getHttpServer())
                .delete(`/api/users/${createdTestUser._id}`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.deletedCount).toEqual(1);

            const findUserResult = await userService.findUser(createdTestUser._id);

            expect(findUserResult).toBeUndefined();

        });

    });

    describe('/api/users/{userId} (GET)', () => {

        it('Should get the target user', async () => {

            const createdAdminUser = await userService.createNewUserWithPrivileges(adminUser);

            const adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdAdminUser._id}`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            const foundUser = response.body;

            expect(foundUser.authLevel).toEqual(createdAdminUser.authLevel);
            expect(foundUser.firstName).toEqual(createdAdminUser.firstName);
            expect(foundUser.lastName).toEqual(createdAdminUser.lastName);
            expect(foundUser.email).toEqual(createdAdminUser.email);
        });
    });
});
