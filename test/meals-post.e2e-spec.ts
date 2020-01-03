import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { LoginJwt } from '../src/auth/models/login-jwt.model';
import dbTestModule from '../src/db-test/db-test.module';
import { MealsController } from '../src/meals/meals.controller';
import { MealsSchema } from '../src/meals/meals.schema';
import { MealsService } from '../src/meals/meals.service';
import { Meal } from '../src/meals/models/meals.model';
import { GuestController } from '../src/users/guest.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, adminUserLoginCredentials, fakeJWT, fakeUserId, mealBodyOne, normalUser, normalUserLoginCredentials, notValidMongoId, userManager, userManagerLoginCredentials } from './static';

describe('MealsController (e2e) - POST', () => {
    let app;
    let guestController: GuestController;
    let userService: UserService;
    let module: TestingModule;
    let mealService: MealsService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Meal', schema: MealsSchema }]),
                AuthModule,
            ],
            controllers: [MealsController, GuestController],
            providers: [MealsService, UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
        guestController = module.get<GuestController>(GuestController);
        mealService = module.get<MealsService>(MealsService);

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

    });

    describe('/api/users/{USER-ID}/meals (POST)', () => {

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

        it('Should return 201 - return the posted meal as ADMIN', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);

            const response = await request(app.getHttpServer())
                .post(`/api/users/${createdUser._id}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            expect(response.body).toBeTruthy();
            const returnedMeal = response.body;

            expect(returnedMeal._id).toBeTruthy();
            expect(returnedMeal.title).toEqual(mealBodyOne.title);
            expect(returnedMeal.description).toEqual(mealBodyOne.description);
            expect(returnedMeal.time).toEqual(mealBodyOne.time);
            expect(returnedMeal.calories).toEqual(mealBodyOne.calories);
        });

        it('Should return 201 - return the posted meal as USER_MANAGER', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);

            const response = await request(app.getHttpServer())
                .post(`/api/users/${createdUser._id}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            expect(response.body).toBeTruthy();
            const returnedMeal = response.body;

            expect(returnedMeal._id).toBeTruthy();
            expect(returnedMeal.title).toEqual(mealBodyOne.title);
            expect(returnedMeal.description).toEqual(mealBodyOne.description);
            expect(returnedMeal.time).toEqual(mealBodyOne.time);
            expect(returnedMeal.calories).toEqual(mealBodyOne.calories);
        });

        it('Should return 201 - return the posted meal as SELF', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdUserLogin = await guestController.login(normalUserLoginCredentials);

            const response = await request(app.getHttpServer())
                .post(`/api/users/${createdUser._id}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${createdUserLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.CREATED);

            expect(response.body).toBeTruthy();
            const returnedMeal = response.body;

            expect(returnedMeal._id).toBeTruthy();
            expect(returnedMeal.title).toEqual(mealBodyOne.title);
            expect(returnedMeal.description).toEqual(mealBodyOne.description);
            expect(returnedMeal.time).toEqual(mealBodyOne.time);
            expect(returnedMeal.calories).toEqual(mealBodyOne.calories);
        });

        it('Should return 400 - Bad Request because of the missing title', async () => {

            const mealBodyNoTitle: Meal = {
                ...mealBodyOne,
                title: '',
            };

            const response = await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyNoTitle)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('title');
        });

        it('Should return 400 - Bad Request because of the missing title', async () => {

            const mealBodyNoTitle: Meal = {
                ...mealBodyOne,
                title: '',
            };

            const response = await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyNoTitle)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('title');
        });

        it('Should return 400 - Bad Request because of the missing calories', async () => {

            const { calories, ...mealbodyNoCalories } = mealBodyOne;

            const response = await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealbodyNoCalories)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('calories');
        });

        it('Should return 400 - Bad Request because of the missing timestamp', async () => {

            const { time, ...mealBodyNotTime } = mealBodyOne;

            const response = await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyNotTime)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('time');
        });

        it('Should return 400 - Bad Request because of the wrong description type', async () => {

            const mealBodyNoTitle: Meal = {
                ...mealBodyOne,
                // @ts-ignore
                description: [],
            };

            const response = await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyNoTitle)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('description');
        });

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyOne)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${fakeJWT}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [SELF, USER_MANAGER, ADMIN]', async () => {

            await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 404 - Not Found because there is no user with the choosed id', async () => {

            await request(app.getHttpServer())
                .post(`/api/users/${fakeUserId}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('Should return 400 - Not Found because the user id is not valid', async () => {

            const response = await request(app.getHttpServer())
                .post(`/api/users/${notValidMongoId}/meals`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('id');
        });

    });
});
