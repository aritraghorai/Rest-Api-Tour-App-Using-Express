const bcrypt = require('bcryptjs/dist/bcrypt');
const cryto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please Tell Us Your Name'],
  },
  email: {
    type: String,
    require: [true, 'Please Tell Us Your Email Id!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Enter A valid Email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'Please Provide A Password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please Enter Your Password'],
    //*This only work in save query
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Paassword is not the same',
    },
  },
  passWordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  //*For Chacking User is Active or not
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//?Middleware
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passWordChangeAt = Date.now() - 1000;
  next();
});
//*User Save middleware
userSchema.pre('save', async function (next) {
  //*Only run is password is modified
  if (!this.isModified('password')) {
    return next();
  }
  //*encript the password
  this.password = await bcrypt.hash(this.password, 12);
  //*We did not need the passwordConfarm
  this.passwordConfirm = undefined;
  next();
});
//*Don't Show Inactive User
userSchema.pre(/^find/, function (next) {
  //*This point to current query string
  this.find({ active: { $ne: false } });
  next();
});
//?Functions
//*To Compare two password
userSchema.methods.correctPassword = async function (
  candidatepassword,
  userPassword
) {
  return await bcrypt.compare(candidatepassword, userPassword);
};
//*
userSchema.methods.changePassWordAfter = function (jwtTimeStrap) {
  if (this.passWordChange) {
    console.log(this.passWordChangeAt, jwtTimeStrap);
    const changeTimeStap = parseInt(this.passWordChangeAt.getTime() / 1000, 10);
    return jwtTimeStrap < changeTimeStap;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = cryto.randomBytes(32).toString('hex');
  this.passwordResetToken = cryto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60000;
  console.log(this.passwordResetExpires);
  return resetToken;
  //*Here We Did Not Save the password
  //*We Just Modify it
};
//*Model Should Be in the last line
const User = mongoose.model('User', userSchema);
module.exports = User;
