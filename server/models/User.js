const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const bookSchema = require('./Book'); // Import schema from Book.js

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [bookSchema], // Set savedBooks to be an array of data that adheres to the bookSchema
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function (next) {
  // Hash user password
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  // Custom method to compare and validate password for logging in
  return bcrypt.compare(password, this.password);
};

userSchema.virtual('bookCount').get(function () {
  // Add a virtual field called `bookCount` that returns the length of savedBooks
  return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
