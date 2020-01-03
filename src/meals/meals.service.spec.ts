import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dbTestModule from '../db-test/db-test.module';
import { UserSchema } from './../users/user.schema';
import { MealsController } from './meals.controller';
import { MealsSchema } from './meals.schema';
import { MealsService } from './meals.service';

describe('UserService', () => {

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

            const userId = '123';
            const mealBody = { A: 'A' };

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
                    return {meals : [mealBody]};
                },
            },
            };

            const returnedMeal = await mealService.addMeal.call(mockEnvironment, userId, mealBody);

            expect(returnedMeal).toEqual(mealBody);
            expect(callArgumentOne._id).toEqual(userId);
            expect(callArgumentTwo.$push.meals).toEqual(mealBody);
            expect(callArgumentThree.new).toEqual(true);
            expect(callArgumentThree.fields.meals.$slice).toEqual(-1);

        });

        it('Should call the userModel.findOneAndUpdate with the user id, the meal and the required settings', async () => {

            const userId = '123';
            const mealBody = { A: 'A' };

            const mockedFunction = jest.fn();

            const mockEnvironment = {
                userModel: {
                    findOneAndUpdate(_1, _2, _3) {

                    mockedFunction();
                    return null;
                },
            },
            };
           
            expect(  mealService.addMeal.bind(mockEnvironment, userId, mealBody) ).rejects.toThrow('HELLO');

        });
    });

});
