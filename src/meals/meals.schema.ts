import * as mongoose from 'mongoose';

export const MealsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    time: { type: Number, required: true },
    calories: { type: Number, required: true },
}, { versionKey: false });
