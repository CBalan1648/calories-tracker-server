import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dbTestModule from '../db-test/db-test.module';
import { DbResponse } from '../helpers/db-response.model';
import { USER_NOT_FOUND } from '../helpers/strings';
import { UserSchema } from './../users/user.schema';
import { MealsController } from './meals.controller';
import { MealsSchema } from './meals.schema';
import { MealsService } from './meals.service';
import { Meal } from './models/meals.model';

const userId = '507f1f77bcf86cd799439011';
const mealId = '507f1f77bcf86cd799439012';

const mealBody: Meal = {
    title: 'mealTitle',
    description: 'newDescription',
    time: 100000000000,
    calories: 200,
};

const successDbReturnValue: DbResponse = {
    n: 1,
    nModified: 1,
    ok: 1,
};

const failureDbReturnValue: DbResponse = {
    n: 0,
    nModified: 0,
    ok: 0,
};

describe('MealService', () => {

    let mealService: MealsService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Meal', schema: MealsSchema }]),
            ],
            controllers: [MealsController],
            providers: [MealsService],
        }).compile();
        mealService = module.get<MealsService>(MealsService);
    });

    describe('addMeal', () => {

        it('Should call the userModel.findOneAndUpdate with the user id, the meal and the required settings', async () => {

            const mockedFunction = jest.fn();

            let callArgumentOne;
            let callArgumentTwo;
            let callArgumentThree;

            const mockEnvironment = {
                userModel: {
                    findOneAndUpdate(argumentOne, argumentTwo, argumentThree) {
                        callArgumentOne = argumentOne;
                        callArgumentTwo = argumentTwo;
                        callArgumentThree = argumentThree;
                        mockedFunction();
                        return { meals: [mealBody] };
                    },
                },
            };

            const returnedMeal = await mealService.addMeal.call(mockEnvironment, userId, mealBody);

            expect(mockedFunction).toBeCalled();
            expect(returnedMeal).toEqual(mealBody);
            expect(callArgumentOne._id).toEqual(userId);
            expect(callArgumentTwo.$push.meals).toEqual(mealBody);
            expect(callArgumentThree.new).toEqual(true);
            expect(callArgumentThree.fields.meals.$slice).toEqual(-1);
        });

        it('Should call the userModel.findOneAndUpdate and throw USER_NOT_FOUND error', async () => {

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    findOneAndUpdate(_1, _2, _3) {

                        mockedFunction();
                        return null;
                    },
                },
            };

            expect(mealService.addMeal.call(mockEnvironment, userId, mealBody)).rejects.toThrow(USER_NOT_FOUND);
            expect(mockedFunction).toBeCalled();
        });
    });

    describe('updateMeal', () => {

        it('Should call the userModel.updateOne with the user id, the meal id and the new data', async () => {

            const mockedFunction = jest.fn();

            let callArgumentOne;
            let callArgumentTwo;

            const mockEnvironment = {
                userModel: {
                    updateOne(argumentOne, argumentTwo) {
                        callArgumentOne = argumentOne;
                        callArgumentTwo = argumentTwo;
                        mockedFunction();
                        return successDbReturnValue;
                    },
                },
            };

            const dbResponse = await mealService.updateMeal.call(mockEnvironment, userId, mealId, mealBody);

            expect(mockedFunction).toBeCalled();
            expect(dbResponse).toEqual(successDbReturnValue);
            expect(callArgumentOne._id).toEqual(userId);
            expect(callArgumentOne['meals._id']).toEqual(mealId);
            expect(callArgumentTwo).toBeTruthy();

            const setData = callArgumentTwo.$set;

            expect(setData['meals.$.title']).toEqual(mealBody.title);
            expect(setData['meals.$.description']).toEqual(mealBody.description);
            expect(setData['meals.$.calories']).toEqual(mealBody.calories);
            expect(setData['meals.$.time']).toEqual(mealBody.time);
        });

        it('Should call the userModel.updateOne and throw USER_NOT_FOUND ERROR', async () => {

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    updateOne(_1, _2) {

                        mockedFunction();
                        return failureDbReturnValue;
                    },
                },
            };

            expect(mealService.updateMeal.call(mockEnvironment, userId, mealId, mealBody)).rejects.toThrow(USER_NOT_FOUND);

            expect(mockedFunction).toBeCalled();
        });
    });

    describe('getMeals', () => {

        it('Should call the userModel.findOne with the user id and the settings', async () => {

            const mockedFunction = jest.fn();

            let callArgumentOne;
            let callArgumentTwo;
            let callArgumentThree;

            const returnValue = { _id: userId, meals: [{ A: 'A' }, { B: 'B' }] };

            const mockEnvironment = {
                userModel: {
                    findOne(argumentOne, argumentTwo, argumentThree) {
                        callArgumentOne = argumentOne;
                        callArgumentTwo = argumentTwo;
                        callArgumentThree = argumentThree;
                        mockedFunction();
                        return returnValue;
                    },
                },
            };

            const getMealsResponse = await mealService.getMeals.call(mockEnvironment, userId);

            expect(mockedFunction).toBeCalled();
            expect(getMealsResponse).toEqual(returnValue);
            expect(callArgumentOne._id).toEqual(userId);
            expect(callArgumentTwo.meals).toEqual(1);
            expect(callArgumentThree.omitUndefined).toEqual(true);
        });

        it('Should call the userModel.findOne and throw USER_NOT_FOUND error', async () => {

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    findOne(_1, _2, _3) {
                        mockedFunction();
                        return null;
                    },
                },
            };

            expect(mealService.getMeals.call(mockEnvironment, userId)).rejects.toThrow(USER_NOT_FOUND);
            expect(mockedFunction).toBeCalled();
        });
    });

    describe('deleteMeal', () => {

        it('Should call the userModel.update with the user id and the meal id', async () => {

            const mockedFunction = jest.fn();
            let callArgumentOne;
            let callArgumentTwo;

            const mockEnvironment = {
                userModel: {
                    update(argumentOne, argumentTwo) {
                        callArgumentOne = argumentOne;
                        callArgumentTwo = argumentTwo;
                        mockedFunction();
                        return successDbReturnValue;
                    },
                },
            };

            const dbResponse = await mealService.deleteMeal.call(mockEnvironment, userId, mealId);

            expect(mockedFunction).toBeCalled();
            expect(dbResponse).toEqual(successDbReturnValue);
            expect(callArgumentOne._id).toEqual(userId);
            expect(callArgumentTwo).toBeTruthy();
            expect(callArgumentTwo.$pull).toBeTruthy();
            expect(callArgumentTwo.$pull.meals).toBeTruthy();
            expect(callArgumentTwo.$pull.meals._id).toEqual(mealId);
        });

        it('Should call the userModel.update and throw USER_NOT_FOUND error', async () => {

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    update(_1, _2) {

                        mockedFunction();
                        return failureDbReturnValue;
                    },
                },
            };

            expect(mealService.deleteMeal.call(mockEnvironment, userId, mealId)).rejects.toThrow(USER_NOT_FOUND);
            expect(mockedFunction).toBeCalled();
        });
    });
});
