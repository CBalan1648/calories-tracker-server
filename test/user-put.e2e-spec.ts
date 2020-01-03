import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginJwt } from '../src/auth/models/login-jwt.model';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { GuestController } from '../src/users/guest.controller';
import { User } from '../src/users/models/user.model';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, fakeJWT, fakeUserId, normalUser, notValidMongoId, userManager, adminUserLoginCredentials, normalUserLoginCredentials, userManagerLoginCredentials } from './static';

describe('UserController (e2e) - PUT', () => {
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

    describe('/api/users/{userId} (PUT)', () => {

        let adminLogin: LoginJwt;
        let userLogin: LoginJwt;
        let userManagerLogin: LoginJwt;

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

        it('Should update target user but email and authLevel', async () => {

            const createdRegularUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdUserLogin = await guestController.login(normalUserLoginCredentials);

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
                .set('Authorization', `Bearer ${createdUserLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.nModified).toEqual(1);

            const updatedUser = await userService.findUser(createdRegularUser._id);

            expect(updatedUser._id).toEqual(createdRegularUser._id);
            expect(updatedUser.firstName).toEqual(testUserPutBody.firstName);
            expect(updatedUser.lastName).toEqual(testUserPutBody.lastName);
            expect(updatedUser.email).toEqual(createdRegularUser.email);
            expect(updatedUser.authLevel).toEqual(createdRegularUser.authLevel);

        });

        it('Should update target user but email', async () => {

            const createdRegularUser = await userService.createNewUserWithPrivileges(normalUser);

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

            expect(response.body.nModified).toEqual(1);

            const updatedUser = await userService.findUser(createdRegularUser._id);

            expect(updatedUser._id).toEqual(createdRegularUser._id);
            expect(updatedUser.firstName).toEqual(testUserPutBody.firstName);
            expect(updatedUser.lastName).toEqual(testUserPutBody.lastName);
            expect(updatedUser.email).toEqual(createdRegularUser.email);
            expect(updatedUser.authLevel).toEqual(testUserPutBody.authLevel);

        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}`)
                .set('Authorization', `Bearer ${fakeJWT}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER_MANAGER in [SELF, ADMIN]', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}`)
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER (NOT SELF) in [SELF, ADMIN]', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}`)
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 400 - Not Found because the user id is not valid', async () => {

            const response = await request(app.getHttpServer())
                .put(`/api/users/${notValidMongoId}`)
                .send(normalUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('id');
        });

    });
});
