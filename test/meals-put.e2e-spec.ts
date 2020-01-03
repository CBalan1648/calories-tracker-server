import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginJwt } from 'src/auth/models/login-jwt.model';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { MealsController } from '../src/meals/meals.controller';
import { MealsSchema } from '../src/meals/meals.schema';
import { MealsService } from '../src/meals/meals.service';
import { GuestController } from '../src/users/guest.controller';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import { fakeJWT, fakeMealId, fakeUserId, mealBodyOne, mealBodyTwo, notValidMongoId } from './meals-static';
import { adminUser, normalUser, userManager } from './user-static';

describe('MealsController (e2e) - PUT', () => {
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

    describe('/api/users/{USER-ID}/meals (PUT)', () => {

        let adminLogin: LoginJwt;
        let userLogin: LoginJwt;
        let userManagerLogin: LoginJwt;

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

        it('Should return 200 - Correctly update the Meal as ADMIN', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdMeal = await mealService.addMeal(createdUser._id, mealBodyOne);

            const response = await request(app.getHttpServer())
                .put(`/api/users/${createdUser._id}/meals/${createdMeal._id}`)
                .send(mealBodyTwo)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body).toBeTruthy();

            expect(response.body.nModified).toEqual(1);

            const userMeals = await mealService.getMeals(createdUser._id);
            const updatedMeal = userMeals.meals[0];

            expect(updatedMeal._id).toEqual(createdMeal._id);

            expect(updatedMeal.title).toEqual(mealBodyTwo.title);
            expect(updatedMeal.description).toEqual(mealBodyTwo.description);
            expect(updatedMeal.time).toEqual(mealBodyTwo.time);
            expect(updatedMeal.calories).toEqual(mealBodyTwo.calories);
        });

        it('Should return 201 - return the posted meal as USER_MANAGER', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdMeal = await mealService.addMeal(createdUser._id, mealBodyOne);

            const response = await request(app.getHttpServer())
                .put(`/api/users/${createdUser._id}/meals/${createdMeal._id}`)
                .send(mealBodyTwo)
                .set('Authorization', `Bearer ${userManagerLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body).toBeTruthy();

            expect(response.body.nModified).toEqual(1);

            const userMeals = await mealService.getMeals(createdUser._id);
            const updatedMeal = userMeals.meals[0];

            expect(updatedMeal._id).toEqual(createdMeal._id);

            expect(updatedMeal.title).toEqual(mealBodyTwo.title);
            expect(updatedMeal.description).toEqual(mealBodyTwo.description);
            expect(updatedMeal.time).toEqual(mealBodyTwo.time);
            expect(updatedMeal.calories).toEqual(mealBodyTwo.calories);
        });

        it('Should return 201 - return the posted meal as SELF', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            const createdUserLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
            const createdMeal = await mealService.addMeal(createdUser._id, mealBodyOne);

            const response = await request(app.getHttpServer())
                .put(`/api/users/${createdUser._id}/meals/${createdMeal._id}`)
                .send(mealBodyTwo)
                .set('Authorization', `Bearer ${createdUserLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            expect(response.body).toBeTruthy();

            expect(response.body.nModified).toEqual(1);

            const userMeals = await mealService.getMeals(createdUser._id);
            const updatedMeal = userMeals.meals[0];

            expect(updatedMeal._id).toEqual(createdMeal._id);

            expect(updatedMeal.title).toEqual(mealBodyTwo.title);
            expect(updatedMeal.description).toEqual(mealBodyTwo.description);
            expect(updatedMeal.time).toEqual(mealBodyTwo.time);
            expect(updatedMeal.calories).toEqual(mealBodyTwo.calories);
        });

        it('Should return 401 - Unauthorized because there is no JWT', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}/meals/${fakeMealId}`)
                .send(mealBodyOne)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 401 - Unauthorized because the provided JWT is invalid', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}/meals/${fakeMealId}`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${fakeJWT}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Should return 403 - Forbidden because the requester has no access to this endpoint USER in [SELF, USER_MANAGER, ADMIN]', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}/meals/${fakeMealId}`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${userLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('Should return 404 - Not Found because there is no user with the choosed id', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}/meals/${fakeMealId}`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('Should return 400 - Not Found because the user id is not valid', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${notValidMongoId}/meals/${fakeMealId}`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('Should return 400 - Not Found because the meal id is not valid', async () => {

            await request(app.getHttpServer())
                .put(`/api/users/${fakeUserId}/meals/${notValidMongoId}`)
                .send(mealBodyOne)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});
