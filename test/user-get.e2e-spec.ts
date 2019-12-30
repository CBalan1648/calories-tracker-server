import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { GuestController } from '../src/users/guest.controller';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, normalUser, userManager } from './user-static';
import { MealsController } from 'src/meals/meals.controller';

describe('UserController (e2e) - GET', () => {
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
            controllers: [GuestController, MealsController],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
        guestController = module.get<GuestController>(GuestController);

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

    });

    describe('/api/users/ (GET)', () => {

        let adminLogin;
        let userLogin;
        let userManagerLogin;

        it('Should generate admin account and login', async () => {
            await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        });

        it('Should generate user account and login', async () => {
            await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        });

        it('Should generate user manager account and login', async () => {
            await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login({ email: userManager.email, password: userManager.password });
        });

        it('Should return 200 - return all users minus passwords and meals as ADMIN', async () => {

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

        it('Should return 200 - return all users minus passwords and meals as USER_MANAGER', async () => {

            const response = await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
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

            await request(app.getHttpServer())
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', 'Bearer TheQuickBrownFoxJumpsOverTheLazyDog')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [ADMIN, USER_MANAGER]', async () => {

            await request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('/api/users/{userId} (GET)', () => {

        let adminLogin;
        let userLogin;
        let userManagerLogin;

        it('Should generate admin account and login', async () => {
            await userService.createNewUserWithPrivileges(adminUser);
            adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        });

        it('Should generate user account and login', async () => {
            await userService.createNewUserWithPrivileges(normalUser);
            userLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        });

        it('Should generate user manager account and login', async () => {
            await userService.createNewUserWithPrivileges(userManager);
            userManagerLogin = await guestController.login({ email: userManager.email, password: userManager.password });
        });

        it('Should get the target user as ADMIN', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            const foundUser = response.body;

            expect(foundUser.authLevel).toEqual(createdUser.authLevel);
            expect(foundUser.firstName).toEqual(createdUser.firstName);
            expect(foundUser.lastName).toEqual(createdUser.lastName);
            expect(foundUser.email).toEqual(createdUser.email);
        });

        it('Should get the target user as USER_MANAGER', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}`)
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            const foundUser = response.body;

            expect(foundUser.authLevel).toEqual(createdUser.authLevel);
            expect(foundUser.firstName).toEqual(createdUser.firstName);
            expect(foundUser.lastName).toEqual(createdUser.lastName);
            expect(foundUser.email).toEqual(createdUser.email);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .delete('/api/users/fakeUserId')
                .set('Authorization', 'Bearer TheQuickBrownFoxJumpsOverTheLazyDog')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [USER_MANAGER, ADMIN]', async () => {

            await request(app.getHttpServer())
                .delete('/api/users/fakeUserID')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });
    });
});
