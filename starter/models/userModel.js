const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password must be longer than 8 characters'],
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //THIS only works on save!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

//Using middleware to encrypt password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
