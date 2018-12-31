import mongoose from 'mongoose';

const { Schema } = mongoose;

const VoteSchema = new Schema({
  recipeId: String,
  voteType: String,
  userId: String,
  dateVoted: String
});

module.exports = mongoose.model('Votes', VoteSchema);
