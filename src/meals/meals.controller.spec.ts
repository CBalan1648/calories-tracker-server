import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { DbResponse } from 'src/helpers/db-response.model';
import dbTestModule from '../db-test/db-test.module';
import { UserSchema } from '../users/user.schema';
import { MealsController } from './meals.controller';
import { MealsSchema } from './meals.schema';
import { MealsService } from './meals.service';
import { Meal } from './models/meals.model';

describe('UserController', () => {
    let mealController: MealsController;
    let mealService: MealsService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                await dbTestModule({ name: (new Date().getTime() * Math.random()).toString(16) }),
                MongooseModule.forFeature([
                    { name: 'Meal', schema: MealsSchema },
                    { name: 'User', schema: UserSchema },
                ]),
            ],
            controllers: [MealsController],
            providers: [MealsService],
        }).compile();

        mealController = module.get<MealsController>(MealsController);
        mealService = module.get<MealsService>(MealsService);
    });

    describe('addMeal', () => {

        const parameters = {
            id: 'ThisIsAUserID',
        };

        const postMealBody: Meal = {
            title: 'The Meal',
            time: 100000011001,
            calories: 350,
        };

        const returnedMealBody: Meal = {
            _id: 'TheAddedMealId',
            title: 'The Meal',
            time: 100000011001,
            calories: 350,
        };

        it('Should call mealService.addMeal with the received body and the userId', async () => {
            const mockedAddMeal = jest.fn();

            jest.spyOn(mealService, 'addMeal').mockImplementation(mockedAddMeal);

            mealController.addMeal(parameters, postMealBody);
            expect(mockedAddMeal).toBeCalledWith(parameters.id, postMealBody);
        });

        it('Should return the userToken', async () => {
            jest.spyOn(mealService, 'addMeal').mockImplementation(() => new Promise((resolve, reject) => resolve(returnedMealBody)));

            expect(await mealController.addMeal(parameters, postMealBody)).toBe(returnedMealBody);
        });
    });

    describe('updateMeal', () => {

        const parameters = {
            id: 'ThisIsAUserID',
            mealId: 'ThisIsAMealID',
        };

        const dbResponse: DbResponse = {
            n: 1,
            nModified: 1,
            ok: 1,
        };

        const mealBody: Meal = {
            _id: 'TheAddedMealId',
            title: 'The Meal',
            time: 100000011001,
            calories: 350,
        };

        it('Should call mealService.updateMeal with the received body, userId and mealId', async () => {
            const mockedUpdatedMeal = jest.fn();

            jest.spyOn(mealService, 'updateMeal').mockImplementation(mockedUpdatedMeal);

            mealController.updateMeal(parameters, mealBody);
            expect(mockedUpdatedMeal).toBeCalledWith(parameters.id, parameters.mealId, mealBody);
        });

        it('Should return the db report', async () => {
            jest.spyOn(mealService, 'updateMeal').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await mealController.updateMeal(parameters, mealBody)).toBe(dbResponse);
        });
    });

    describe('getMeals', () => {

        const parameters = {
            id: 'ThisIsAUserID',
        };

        const mealBody: Meal = {
            _id: 'TheAddedMealId',
            title: 'The Meal',
            time: 100000011001,
            calories: 350,
        };

        const mealBodyTwo: Meal = {
            _id: 'TheAddedMealId2',
            title: 'The Meal2',
            time: 100000011002,
            calories: 352,
        };

        const mealArray = [mealBody, mealBodyTwo];

        it('Should call mealService.getMeals with the received userId', async () => {
            const mockedGetMeals = jest.fn();

            jest.spyOn(mealService, 'getMeals').mockImplementation(mockedGetMeals);

            mealController.getMeals(parameters);
            expect(mockedGetMeals).toBeCalledWith(parameters.id);
        });

        it('Should return a mealsArray', async () => {
            jest.spyOn(mealService, 'getMeals').mockImplementation(() => new Promise((resolve, reject) => resolve(mealArray)));

            expect(await mealController.getMeals(parameters)).toBe(mealArray);
        });
    });

    describe('deleteMeal', () => {

        const parameters = {
            id: 'ThisIsAUserID',
            mealId: 'ThisIsAMealID',
        };

        const dbResponse: DbResponse = {
            n: 1,
            nModified: 1,
            ok: 1,
        };

        it('Should call mealService.deleteMeal with the received userId and mealId', async () => {
            const mockedDeleteMeal = jest.fn();

            jest.spyOn(mealService, 'deleteMeal').mockImplementation(mockedDeleteMeal);

            mealController.deleteMeal(parameters);
            expect(mockedDeleteMeal).toBeCalledWith(parameters.id, parameters.mealId);
        });

        it('Should return the db report', async () => {
            jest.spyOn(mealService, 'deleteMeal').mockImplementation(() => new Promise((resolve, reject) => resolve(dbResponse)));

            expect(await mealController.deleteMeal(parameters)).toBe(dbResponse);
        });
    });

});
