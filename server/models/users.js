import mongoose from 'mongoose';

const { Schema } = mongoose;

const usersSchema = new Schema({
  fullName: String,
  email: String,
  password: String
});

module.exports = mongoose.model('Users', usersSchema);
