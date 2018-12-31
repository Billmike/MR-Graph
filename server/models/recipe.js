import mongoose from 'mongoose';

const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: String,
  description: String,
  category: String,
  cookTime: String,
  ingredients: String,
  instructions: String,
  upvotes: Array,
  downvotes: Array,
  ownerId: String
});

module.exports = mongoose.model('Recipes', recipeSchema);
