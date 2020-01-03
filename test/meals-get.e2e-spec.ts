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
import { GuestController } from '../src/users/guest.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { adminUser, adminUserLoginCredentials, fakeJWT, fakeUserId, mealBodyOne, mealBodyTwo, normalUser, normalUserLoginCredentials, notValidMongoId, userManager, userManagerLoginCredentials } from './static';

describe('MealsController (e2e) - GET', () => {
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

    describe('/api/users/{USER-ID}/meals (GET)', () => {

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

        it('Should return 200 - return user meals as ADMIN', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            mealService.addMeal(createdUser._id, mealBodyOne);
            mealService.addMeal(createdUser._id, mealBodyTwo);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}/meals`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.meals).toBeTruthy();

            const returnedMeals = response.body.meals;

            const addedMealsArray = [mealBodyOne, mealBodyTwo];

            for (const [index, testedMeal] of [...returnedMeals].entries()) {

                const addedUser = addedMealsArray[index];
                expect(testedMeal._id).toBeTruthy();
                expect(testedMeal.title).toEqual(addedUser.title);
                expect(testedMeal.description).toEqual(addedUser.description);
                expect(testedMeal.time).toEqual(addedUser.time);
                expect(testedMeal.calories).toEqual(addedUser.calories);
            }
        });

        it('Should return 200 - return user meals as USERMANAGER', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            mealService.addMeal(createdUser._id, mealBodyOne);
            mealService.addMeal(createdUser._id, mealBodyTwo);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}/meals`)
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.meals).toBeTruthy();

            const returnedMeals = response.body.meals;

            const addedMealsArray = [mealBodyOne, mealBodyTwo];

            for (const [index, testedMeal] of [...returnedMeals].entries()) {

                const addedUser = addedMealsArray[index];
                expect(testedMeal._id).toBeTruthy();
                expect(testedMeal.title).toEqual(addedUser.title);
                expect(testedMeal.description).toEqual(addedUser.description);
                expect(testedMeal.time).toEqual(addedUser.time);
                expect(testedMeal.calories).toEqual(addedUser.calories);
            }
        });

        it('Should return 200 - return user meals as SELF', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdUserLogin = await guestController.login(normalUserLoginCredentials);
            mealService.addMeal(createdUser._id, mealBodyOne);
            mealService.addMeal(createdUser._id, mealBodyTwo);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}/meals`)
                .set('Authorization', `Bearer ${createdUserLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body.meals).toBeTruthy();

            const returnedMeals = response.body.meals;

            const addedMealsArray = [mealBodyOne, mealBodyTwo];

            for (const [index, testedMeal] of [...returnedMeals].entries()) {

                const addedUser = addedMealsArray[index];
                expect(testedMeal._id).toBeTruthy();
                expect(testedMeal.title).toEqual(addedUser.title);
                expect(testedMeal.description).toEqual(addedUser.description);
                expect(testedMeal.time).toEqual(addedUser.time);
                expect(testedMeal.calories).toEqual(addedUser.calories);
            }
        });

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            await request(app.getHttpServer())
                .get(`/api/users/${fakeUserId}/meals`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .get(`/api/users/${fakeUserId}/meals`)
                .set('Authorization', `Bearer ${fakeJWT}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [SELF, USER_MANAGER, ADMIN]', async () => {

            await request(app.getHttpServer())
                .get(`/api/users/${fakeUserId}/meals`)
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 404 - NotFound because there is no user with the choosed id', async () => {

            await request(app.getHttpServer())
                .get(`/api/users/${fakeUserId}/meals`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('Should return 400 - NotFound because the user id is not valid', async () => {

            const response = await request(app.getHttpServer())
                .get(`/api/users/${notValidMongoId}/meals`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0].property).toEqual('id');
        });
    });
});
