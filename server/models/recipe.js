import mongoose from 'mongoose';

const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: String,
  description: String,
  category: String,
  cookTime: String,
  ingredients: String,
  instructions: String,
  ownerId: String
});

module.exports = mongoose.model('Recipes', recipeSchema);
