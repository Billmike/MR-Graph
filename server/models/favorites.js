import mongoose from 'mongoose';

const { Schema } = mongoose;

const favoritesSchema = new Schema({
  recipeId: String,
  email: String,
  fullName: String
});

module.exports = mongoose.model('Favorites', favoritesSchema);
