import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginJwt } from '../src/auth/models/login-jwt.model';
import { UserRegistrationBodyDto } from 'src/users/models/user-registration-body.model';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { GuestController } from '../src/users/guest.controller';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUserLoginCredentials, normalUser, normalUserLoginCredentials } from './static';

describe('GuestController (e2e) - POST', () => {
    let app;
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

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('/api/new/ (POST)', () => {

        it('Should return 200 - create a new user', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(normalUser)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            const createdNewUser = response.body;

            const allUsers = await userService.findAll();
            const dbCreatedUser = allUsers[0];

            expect(createdNewUser._id).toBeTruthy();
            expect(createdNewUser.firstName).toEqual(normalUser.firstName);
            expect(createdNewUser.lastName).toEqual(normalUser.lastName);
            expect(createdNewUser.email).toEqual(normalUser.email);
            // @ts-ignore
            expect(createdNewUser.password).toBeUndefined();
            expect(createdNewUser.authLevel).toEqual('USER');

            expect(dbCreatedUser._id).toBeTruthy();
            expect(dbCreatedUser.firstName).toEqual(normalUser.firstName);
            expect(dbCreatedUser.lastName).toEqual(normalUser.lastName);
            expect(dbCreatedUser.email).toEqual(normalUser.email);
            expect(dbCreatedUser.authLevel).toEqual('USER');
        });

        it('Should return 200 - create a new user ignoring the authLevel', async () => {

            const normalUserWithAuthLevel = {
                ...normalUser,
                authLevel: 'SUPER-MEGA-ADMIN',
            };

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(normalUserWithAuthLevel)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            const createdNewUser = response.body;

            const allUsers = await userService.findAll();
            const dbCreatedUser = allUsers[0];

            expect(createdNewUser._id).toBeTruthy();
            expect(createdNewUser.firstName).toEqual(normalUserWithAuthLevel.firstName);
            expect(createdNewUser.lastName).toEqual(normalUserWithAuthLevel.lastName);
            expect(createdNewUser.email).toEqual(normalUserWithAuthLevel.email);
            // @ts-ignore
            expect(createdNewUser.password).toBeUndefined();
            expect(createdNewUser.authLevel).toEqual('USER');

            expect(dbCreatedUser._id).toBeTruthy();
            expect(dbCreatedUser.firstName).toEqual(normalUserWithAuthLevel.firstName);
            expect(dbCreatedUser.lastName).toEqual(normalUserWithAuthLevel.lastName);
            expect(dbCreatedUser.email).toEqual(normalUserWithAuthLevel.email);
            expect(dbCreatedUser.authLevel).toEqual('USER');
        });

        it('Should return 400 - Bad request because of the empty first name', async () => {

            const testUserEmptyFirstName: UserRegistrationBodyDto = {
                ...normalUser,
                firstName: '',
            };

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(testUserEmptyFirstName)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('firstName');
        });

        it('Should return 400 - Bad request because of the empty last name', async () => {

            const testUserEmptyLastName: UserRegistrationBodyDto = {
                ...normalUser,
                lastName: '',
            };

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(testUserEmptyLastName)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('lastName');
        });

        it('Should return 400 - Bad request because of the "email" not being an email', async () => {

            const testUserInvalidEmail: UserRegistrationBodyDto = {
                ...normalUser,
                email: 'Hello',
            };

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(testUserInvalidEmail)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('email');
        });

        it('Should return 400 - Bad request because of the password being shorter than 12 chars', async () => {

            const testUserTooShortPassword: UserRegistrationBodyDto = {
                ...normalUser,
                password: 'password',
            };

            const response = await request(app.getHttpServer())
                .post('/api/new')
                .send(testUserTooShortPassword)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('password');
        });

        it('Should return 200 - Return the JWT', async () => {

            await userService.createNewUserWithPrivileges(normalUser);

            const response = await request(app.getHttpServer())
                .post('/api/login')
                .send(normalUserLoginCredentials)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            const loginResponse: LoginJwt = response.body;

            expect(loginResponse.access_token).toBeTruthy();
        });

        it('Should return 404 - Because there is no user for those credentials', async () => {

            await request(app.getHttpServer())
                .post('/api/login')
                .send(adminUserLoginCredentials)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.NOT_FOUND);

        });
    });
});
