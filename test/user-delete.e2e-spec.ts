import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { GuestController } from '../src/users/guest.controller';
import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';
import { UserController } from '../src/users/user.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, normalUser, userManager } from './user-static';

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

    describe('/api/users/{userId} (DELETE)', () => {

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

        it('Should delete the target user', async () => {

            await userService.createNewUserWithPrivileges(adminUser);

            const testUser: UserRegistrationBodyDto = {
                firstName: 'TestFirstName',
                lastName: 'TestLastName',
                email: 'testUser@caloriesTracker.com',
                password: '123123123123',
                authLevel: 'USER',
            };

            const createdTestUser = await userService.createNewUserWithPrivileges(testUser);

            const response = await request(app.getHttpServer())
                .delete(`/api/users/${createdTestUser._id}`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.deletedCount).toEqual(1);

            const findUserResult = await userService.findUser(createdTestUser._id);

            expect(findUserResult).toBeUndefined();
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .delete('/api/users/fakeUserId')
                .set('Authorization', 'Bearer TheQuickBrownFoxJumpsOverTheLazyDog')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [ADMIN]', async () => {

            await request(app.getHttpServer())
                .delete('/api/users/fakeUserID')
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER_MANAGER in [ADMIN]', async () => {

            await request(app.getHttpServer())
                .delete('/api/users/fakeUserID')
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });
    });
});