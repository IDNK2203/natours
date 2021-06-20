const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    required: [true, 'please provide a name'],
    type: String
  },
  email: {
    type: String,
    required: [true, 'please provide a email'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'please provide a valid email'
    },
    lowercase: true
  },
  role: {
    type: String,
    enum: ['regular', 'guide', 'lead-guide', 'admin'],
    default: 'regular'
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm a password'],
    validate: {
      // only works for SAVE and CREATE method
      validator: function(el) {
        return el === this.password;
      },
      message: 'confirm your password'
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordResetToken: String,
  tokenExpiresAt: Date,
  updatePasswordAt: Date,
  photo: String
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.pre('save', async function(next) {
  // check if password was modified upon creating or updating user
  if (!this.isModified('password')) return next();
  // if were saving or updating doc and password was not modified don't run the code below.

  // Note
  // upon doc creation password will be modified
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.updatePasswordAt = Date.now() + 1000;
  next();
});

userSchema.method({
  passwordCheck: async function(incomingPassword, passwordHash) {
    return await bcrypt.compare(incomingPassword, passwordHash);
  },

  updatePasswordAtCheck: function(tokenIat) {
    if (this.updatePasswordAt) {
      const passwordDate = new Date(this.updatePasswordAt);
      const tokenDate = new Date(tokenIat * 1000);

      return passwordDate > tokenDate;
    }
    return false;
  },

  createPasswordResetToken: function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.tokenExpiresAt = Date.now() + 10 * 60 * 1000;
    return resetToken;
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;
