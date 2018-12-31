import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommentSchema = new Schema({
  fullName: String,
  timePosted: String,
  comment: String,
  recipeId: String
});

module.exports = mongoose.model('Comments', CommentSchema);
