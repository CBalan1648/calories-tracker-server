import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginJwt } from '../src/auth/models/login-jwt.model';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { USER } from '../src/helpers/userLevel.constants';
import { GuestController } from '../src/users/guest.controller';
import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, fakeJWT, normalUser, userManager, adminUserLoginCredentials, normalUserLoginCredentials, userManagerLoginCredentials } from './static';

describe('UserController (e2e) - POST', () => {
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

        let adminLogin: LoginJwt;
        let userLogin: LoginJwt;
        let userManagerLogin: LoginJwt;

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
            await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login(adminUserLoginCredentials);
        });

        it('Should generate user account and login', async () => {
            await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login(normalUserLoginCredentials);
        });

        it('Should generate user manager account and login', async () => {
            await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login(userManagerLoginCredentials);
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

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${fakeJWT}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [ADMIN]', async () => {

            await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER_MANAGER in [ADMIN]', async () => {

            await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });
    });
});
