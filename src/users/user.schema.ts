import * as mongoose from 'mongoose';
import { MealsSchema } from '..//meals/meals.schema';
import { USER, USER_MANAGER, ADMIN } from '../helpers/userLevel.constants';

export const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    targetCalories: { type: Number, default: 0 },
    authLevel: { type: String, enum: [USER, USER_MANAGER, ADMIN], default: USER },
    password: { type: String, required: true },
    meals: { type: [MealsSchema], default: [] },

}, { versionKey: false });
