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
import { MealsSchema } from '../src/meals/meals.schema';
import { MealsService } from '../src/meals/meals.service';
import { mealBodyOne, mealBodyTwo } from './meals-static';

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
            controllers: [UserController, GuestController],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
        guestController = module.get<GuestController>(GuestController);
        mealService = module.get<MealsService>(MealsService);

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

        it('Should return 200 - return user meals as ADMIN', async () => {

            const createdUser = await userService.createNewUserWithPrivileges(normalUser);
            mealService.addMeal(createdUser._id, mealBodyOne);
            mealService.addMeal(createdUser._id, mealBodyTwo);

            const response = await request(app.getHttpServer())
                .get(`/api/users/${createdUser._id}/meals`)
                .set('Authorization', `Bearer ${adminLogin.access_token}`)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            const meals = response.body;

            console.log('MEALS ', meals);

            const addedUsersArray = [adminUser, normalUser];

            for (const [index, testedUser] of [...meals].entries()) {

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

    });

});
